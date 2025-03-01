import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/models";
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

    // 사용자의 쿠폰 목록 조회
    const coupons = await Coupon.find({
      user_id: session.user.uid,
      is_used: false,
      valid_to: { $gte: new Date() }
    });

    return NextResponse.json(
      {
        status: "success",
        data: {
          coupons,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("쿠폰 조회 오류:", error);
    return NextResponse.json(
      { error: "쿠폰 조회 중 오류가 발생했습니다." },
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

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "쿠폰 코드를 입력해주세요." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 쿠폰 코드 유효성 검사
    const coupon = await Coupon.findOne({ code });

    if (!coupon) {
      return NextResponse.json(
        { error: "유효하지 않은 쿠폰 코드입니다." },
        { status: 404 }
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

    if (coupon.user_id && coupon.user_id !== session.user.uid) {
      return NextResponse.json(
        { error: "다른 사용자에게 할당된 쿠폰입니다." },
        { status: 403 }
      );
    }

    // 쿠폰이 할당되지 않은 경우 현재 사용자에게 할당
    if (!coupon.user_id) {
      coupon.user_id = session.user.uid;
      await coupon.save();
    }

    return NextResponse.json(
      {
        status: "success",
        data: {
          coupon,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("쿠폰 등록 오류:", error);
    return NextResponse.json(
      { error: "쿠폰 등록 중 오류가 발생했습니다." },
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

    const { couponId } = await req.json();

    if (!couponId) {
      return NextResponse.json(
        { error: "쿠폰 ID를 입력해주세요." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 쿠폰 사용 처리
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

    return NextResponse.json(
      {
        status: "success",
        message: "쿠폰이 성공적으로 사용되었습니다.",
        data: {
          coupon,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("쿠폰 사용 오류:", error);
    return NextResponse.json(
      { error: "쿠폰 사용 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 