import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import { KeywordHistory, User } from "@/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const { keyword } = await req.json();

    if (!keyword) {
      return NextResponse.json(
        { error: "키워드를 입력해주세요." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 사용자 정보 조회
    const user = await User.findOne({ uid: session.user.uid });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 사용자의 알고리즘 사용 횟수 확인
    // 실제 구현에서는 멤버십 제한과 비교하여 사용 가능 여부 확인 필요

    // 라운드 번호 생성 (실제 구현에서는 더 복잡한 로직이 필요할 수 있음)
    const lastKeywordHistory = await KeywordHistory.findOne({ uid: user.uid })
      .sort({ round_no: -1 })
      .limit(1);
    
    const round_no = lastKeywordHistory 
      ? (parseInt(lastKeywordHistory.round_no) + 1).toString() 
      : "1";

    // 키워드 히스토리 생성
    const newKeywordHistory = await KeywordHistory.create({
      keyword,
      newKeyword: true,
      country: user.country || "KR",
      lang: user.lang || "ko",
      recKeywords: [],
      deletedKeywords: [],
      round_no,
      status: "0", // 초기 상태는 비활성
      uid: user.uid,
      use_yn: "Y",
      scheduler_yn: "N",
      video_tp: "02",
      level: 1,
      create_user: user.uid,
      create_dt: new Date(),
      update_user: user.uid,
      update_dt: new Date(),
    });

    // 사용자의 알고리즘 사용 횟수 증가
    await User.findOneAndUpdate(
      { uid: user.uid },
      { $inc: { algorithm_use_count: 1 } }
    );

    return NextResponse.json(
      {
        status: "success",
        data: {
          history: newKeywordHistory,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("키워드 검색 오류:", error);
    return NextResponse.json(
      { error: "키워드 검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 