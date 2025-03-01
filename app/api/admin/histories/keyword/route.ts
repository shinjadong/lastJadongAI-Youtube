import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import { KeywordHistory, User } from "@/models";
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
    const keyword = url.searchParams.get("keyword");
    const uid = url.searchParams.get("uid");
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    // 쿼리 조건 구성
    const query: any = {};
    
    if (keyword) {
      query.keyword = { $regex: keyword, $options: "i" };
    }
    
    if (uid) {
      query.uid = uid;
    }
    
    if (status) {
      query.status = status;
    }

    // 페이지네이션 계산
    const skip = (page - 1) * limit;
    
    // 키워드 히스토리 목록 조회
    const histories = await KeywordHistory.find(query)
      .sort({ create_dt: -1 })
      .skip(skip)
      .limit(limit);
    
    // 전체 키워드 히스토리 수 조회
    const total = await KeywordHistory.countDocuments(query);

    // 사용자 정보 조회 (uid 기준으로 그룹화)
    const userIds = [...new Set(histories.map(history => history.uid))];
    const users = await User.find({ uid: { $in: userIds } })
      .select("uid email nickname");
    
    const userMap = users.reduce((map, user) => {
      map[user.uid] = { email: user.email, nickname: user.nickname };
      return map;
    }, {} as Record<string, { email: string, nickname: string }>);

    // 사용자 정보를 포함한 히스토리 데이터 구성
    const historiesWithUserInfo = histories.map(history => {
      const historyObj = history.toObject();
      const userInfo = userMap[history.uid] || { email: "알 수 없음", nickname: "알 수 없음" };
      return {
        ...historyObj,
        userEmail: userInfo.email,
        userNickname: userInfo.nickname,
      };
    });

    return NextResponse.json(
      {
        status: "success",
        data: {
          histories: historiesWithUserInfo,
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
    console.error("키워드 히스토리 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "키워드 히스토리 목록 조회 중 오류가 발생했습니다." },
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

    const { historyId, status, level } = await req.json();

    if (!historyId) {
      return NextResponse.json(
        { error: "히스토리 ID는 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 업데이트할 필드 구성
    const updateFields: any = {
      update_user: session.user.uid,
      update_dt: new Date(),
    };
    
    if (status !== undefined) {
      updateFields.status = status;
    }
    
    if (level !== undefined) {
      updateFields.level = level;
    }

    // 키워드 히스토리 업데이트
    const updatedHistory = await KeywordHistory.findByIdAndUpdate(
      historyId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedHistory) {
      return NextResponse.json(
        { error: "키워드 히스토리를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "키워드 히스토리가 성공적으로 업데이트되었습니다.",
        data: {
          history: updatedHistory,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("키워드 히스토리 업데이트 오류:", error);
    return NextResponse.json(
      { error: "키워드 히스토리 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 