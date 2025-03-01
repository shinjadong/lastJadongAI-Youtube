import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import { Video, KeywordHistory, User } from "@/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (session.user.user_tp !== "20") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const url = new URL(req.url);
    const videoId = url.searchParams.get("videoId");
    const keyword = url.searchParams.get("keyword");
    const channelId = url.searchParams.get("channelId");
    const uid = url.searchParams.get("uid");
    const round_no = url.searchParams.get("round_no");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    // 쿼리 조건 구성
    const query: any = {};
    
    if (videoId) {
      query.videoId = videoId;
    }
    
    if (keyword) {
      query.keyword = { $regex: keyword, $options: "i" };
    }
    
    if (channelId) {
      query.channelId = channelId;
    }
    
    if (uid) {
      query.uid = uid;
    }
    
    if (round_no) {
      query.round_no = round_no;
    }

    // 페이지네이션 계산
    const skip = (page - 1) * limit;
    
    // 비디오 목록 조회
    const videos = await Video.find(query)
      .sort({ create_dt: -1 })
      .skip(skip)
      .limit(limit);
    
    // 전체 비디오 수 조회
    const total = await Video.countDocuments(query);

    // 사용자 정보 조회 (uid 기준으로 그룹화)
    const userIds = [...new Set(videos.map(video => video.uid))];
    const users = await User.find({ uid: { $in: userIds } })
      .select("uid email nickname");
    
    const userMap = users.reduce((map, user) => {
      map[user.uid] = { email: user.email, nickname: user.nickname };
      return map;
    }, {} as Record<string, { email: string, nickname: string }>);

    // 키워드 히스토리 정보 조회 (uid와 round_no 기준으로 그룹화)
    const historyKeys = videos.map(video => ({
      uid: video.uid,
      round_no: video.round_no
    }));
    
    const uniqueHistoryKeys = historyKeys.filter((key, index, self) => 
      index === self.findIndex(k => k.uid === key.uid && k.round_no === key.round_no)
    );
    
    const histories = await KeywordHistory.find({
      $or: uniqueHistoryKeys.map(key => ({
        uid: key.uid,
        round_no: key.round_no
      }))
    }).select("uid round_no keyword status level");
    
    const historyMap = histories.reduce((map, history) => {
      const key = `${history.uid}-${history.round_no}`;
      map[key] = {
        keyword: history.keyword,
        status: history.status,
        level: history.level
      };
      return map;
    }, {} as Record<string, { keyword: string, status: string, level: number }>);

    // 사용자 정보와 히스토리 정보를 포함한 비디오 데이터 구성
    const videosWithInfo = videos.map(video => {
      const videoObj = video.toObject();
      const userInfo = userMap[video.uid] || { email: "알 수 없음", nickname: "알 수 없음" };
      const historyKey = `${video.uid}-${video.round_no}`;
      const historyInfo = historyMap[historyKey] || { keyword: "알 수 없음", status: "0", level: 0 };
      
      return {
        ...videoObj,
        userEmail: userInfo.email,
        userNickname: userInfo.nickname,
        historyKeyword: historyInfo.keyword,
        historyStatus: historyInfo.status,
        historyLevel: historyInfo.level
      };
    });

    return NextResponse.json(
      {
        status: "success",
        data: {
          videos: videosWithInfo,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("비디오 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "비디오 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (session.user.user_tp !== "20") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const videoData = await req.json();

    // 필수 필드 검증
    const requiredFields = [
      "videoId", "title", "thumbnail", "duration", "views", 
      "channelId", "channelTitle", "keyword", "round_no", "uid", "publishDate"
    ];
    
    for (const field of requiredFields) {
      if (!videoData[field]) {
        return NextResponse.json(
          { error: `${field} 필드는 필수 입력 항목입니다.` },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    // 사용자 존재 여부 확인
    const user = await User.findOne({ uid: videoData.uid });
    if (!user) {
      return NextResponse.json(
        { error: "지정된 사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 키워드 히스토리 존재 여부 확인
    const history = await KeywordHistory.findOne({
      uid: videoData.uid,
      round_no: videoData.round_no
    });
    
    if (!history) {
      return NextResponse.json(
        { error: "지정된 키워드 히스토리를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 비디오 중복 확인
    const existingVideo = await Video.findOne({
      videoId: videoData.videoId,
      uid: videoData.uid,
      round_no: videoData.round_no
    });
    
    if (existingVideo) {
      return NextResponse.json(
        { error: "이미 등록된 비디오입니다." },
        { status: 409 }
      );
    }

    // 비디오 생성
    const newVideo = await Video.create({
      ...videoData,
      create_dt: new Date(),
      update_dt: new Date()
    });

    return NextResponse.json(
      {
        status: "success",
        message: "비디오가 성공적으로 등록되었습니다.",
        data: {
          video: newVideo,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("비디오 등록 오류:", error);
    return NextResponse.json(
      { error: "비디오 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (session.user.user_tp !== "20") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { videoId, ...updateData } = await req.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "비디오 ID는 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 업데이트할 필드 구성
    const updateFields = {
      ...updateData,
      update_dt: new Date()
    };

    // 비디오 업데이트
    const updatedVideo = await Video.findOneAndUpdate(
      { videoId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedVideo) {
      return NextResponse.json(
        { error: "비디오를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "비디오가 성공적으로 업데이트되었습니다.",
        data: {
          video: updatedVideo,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("비디오 업데이트 오류:", error);
    return NextResponse.json(
      { error: "비디오 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (session.user.user_tp !== "20") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const videoId = url.searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "비디오 ID는 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 비디오 삭제
    const deletedVideo = await Video.findOneAndDelete({ videoId });

    if (!deletedVideo) {
      return NextResponse.json(
        { error: "비디오를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "비디오가 성공적으로 삭제되었습니다.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("비디오 삭제 오류:", error);
    return NextResponse.json(
      { error: "비디오 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 