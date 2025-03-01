import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import { KeywordHistory } from "@/models";
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

    await connectToDatabase();

    // 사용자의 키워드 히스토리 조회
    const histories = await KeywordHistory.find({ uid: session.user.uid })
      .sort({ round_no: -1 })
      .select("keyword status round_no level _id uid");

    return NextResponse.json(
      {
        status: "success",
        data: {
          histories,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("키워드 히스토리 조회 오류:", error);
    return NextResponse.json(
      { error: "키워드 히스토리 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 