import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import { User, KeywordHistory, Video, Coupon } from "@/models";
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

    // 총 사용자 수 조회
    const totalUsers = await User.countDocuments();
    
    // 총 키워드 수 조회
    const totalKeywords = await KeywordHistory.countDocuments();
    
    // 총 비디오 수 조회
    const totalVideos = await Video.countDocuments();
    
    // 총 쿠폰 수 조회
    const totalCoupons = await Coupon.countDocuments({ is_used: false });
    
    // 멤버십 요청 수 조회
    const membershipRequests = await User.countDocuments({ membershipAskYn: "Y" });

    // 최근 가입 사용자 조회
    const recentUsers = await User.find()
      .sort({ create_dt: -1 })
      .limit(5)
      .select("email nickname create_dt");

    // 최근 검색 키워드 조회
    const recentKeywords = await KeywordHistory.find()
      .sort({ create_dt: -1 })
      .limit(5)
      .select("keyword uid create_dt");

    return NextResponse.json(
      {
        status: "success",
        data: {
          totalUsers,
          totalKeywords,
          totalVideos,
          totalCoupons,
          membershipRequests,
          recentUsers,
          recentKeywords
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("관리자 통계 조회 오류:", error);
    return NextResponse.json(
      { error: "관리자 통계 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 