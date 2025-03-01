import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import { User, Coupon } from "@/models";
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

    const { prod_tp, couponId } = await req.json();

    // 필수 필드 검증
    if (!prod_tp) {
      return NextResponse.json(
        { error: "멤버십 유형은 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    // 멤버십 유형 검증
    const validProdTypes = ["10", "20", "21", "22", "23", "24", "25"];
    if (!validProdTypes.includes(prod_tp)) {
      return NextResponse.json(
        { error: "유효하지 않은 멤버십 유형입니다." },
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

    // 이미 동일한 멤버십인 경우
    if (user.prod_tp === prod_tp) {
      return NextResponse.json(
        { error: "이미 해당 멤버십을 사용 중입니다." },
        { status: 400 }
      );
    }

    // 쿠폰 처리
    let appliedCoupon = null;
    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      
      if (!coupon) {
        return NextResponse.json(
          { error: "쿠폰을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      
      if (coupon.user_id !== session.user.uid) {
        return NextResponse.json(
          { error: "해당 쿠폰을 사용할 권한이 없습니다." },
          { status: 403 }
        );
      }
      
      if (coupon.is_used) {
        return NextResponse.json(
          { error: "이미 사용된 쿠폰입니다." },
          { status: 400 }
        );
      }
      
      if (coupon.valid_to < new Date()) {
        return NextResponse.json(
          { error: "만료된 쿠폰입니다." },
          { status: 400 }
        );
      }
      
      // 쿠폰 사용 처리
      coupon.is_used = true;
      await coupon.save();
      appliedCoupon = coupon;
    }

    // 멤버십 업그레이드
    user.prod_tp = prod_tp;
    user.membershipAskYn = "N"; // 멤버십 요청 상태 초기화
    await user.save();

    // 결제 처리는 실제 구현에서 추가 필요
    // 여기서는 간단히 멤버십 업그레이드만 처리

    return NextResponse.json(
      {
        status: "success",
        message: "멤버십이 성공적으로 업그레이드되었습니다.",
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            nickname: user.nickname,
            prod_tp: user.prod_tp,
          },
          appliedCoupon,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("멤버십 업그레이드 오류:", error);
    return NextResponse.json(
      { error: "멤버십 업그레이드 중 오류가 발생했습니다." },
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

    await connectToDatabase();

    // 사용자 정보 조회
    const user = await User.findOne({ uid: session.user.uid });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 멤버십 요청 상태 업데이트
    user.membershipAskYn = "Y";
    await user.save();

    return NextResponse.json(
      {
        status: "success",
        message: "멤버십 요청이 성공적으로 등록되었습니다.",
        data: {
          user: {
            uid: user.uid,
            email: user.email,
            nickname: user.nickname,
            membershipAskYn: user.membershipAskYn,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("멤버십 요청 오류:", error);
    return NextResponse.json(
      { error: "멤버십 요청 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 