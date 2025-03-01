import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import { KeywordHistory, Video } from "@/models";
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

    const url = new URL(req.url);
    const round_no = url.searchParams.get("round_no");

    if (!round_no) {
      return NextResponse.json(
        { error: "round_no 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 해당 라운드의 키워드 히스토리 조회
    const history = await KeywordHistory.findOne({
      uid: session.user.uid,
      round_no,
    }).select("keyword round_no status level _id");

    if (!history) {
      return NextResponse.json(
        { error: "해당 라운드의 키워드 히스토리를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 해당 라운드의 비디오 목록 조회
    const videos = await Video.find({
      uid: session.user.uid,
      round_no,
    }).sort({ views: -1 });

    // 필터 정보는 현재 구현하지 않음
    const filter = {};

    return NextResponse.json(
      {
        status: "success",
        data: {
          videos,
          history,
          filter,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("비디오 조회 오류:", error);
    return NextResponse.json(
      { error: "비디오 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 