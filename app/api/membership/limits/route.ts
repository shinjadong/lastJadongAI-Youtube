import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/mongodb";
import { MembershipLimit } from "@/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    // 세션 체크를 제거하여 비로그인 상태에서도 접근 가능하게 함
    // const session = await getServerSession(authOptions);

    // if (!session || !session.user) {
    //   return NextResponse.json(
    //     { error: "인증되지 않은 요청입니다." },
    //     { status: 401 }
    //   );
    // }

    const { db } = await connectToDatabase();
    
    // 멤버십 한도 정보 가져오기
    const membershipLimit = await db.collection("membershiplimits").findOne({});
    
    if (!membershipLimit) {
      return NextResponse.json(
        { status: "error", error: "멤버십 한도 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      status: "success",
      data: {
        membershipLimit: {
          wt_use_count: membershipLimit.wt_use_count,
          ca_channel_count: membershipLimit.ca_channel_count,
          ca_channel_use_count: membershipLimit.ca_channel_use_count,
          ca_use_count: membershipLimit.ca_use_count,
          cm_use_count: membershipLimit.cm_use_count,
          km_use_count: membershipLimit.km_use_count,
          algorithm_use_count: membershipLimit.algorithm_use_count,
        },
      },
    });
  } catch (error) {
    console.error("멤버십 한도 정보 조회 오류:", error);
    return NextResponse.json(
      { status: "error", error: "멤버십 한도 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 