import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import { Coupon, User } from "@/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { randomBytes } from "crypto";

// 쿠폰 코드 생성 함수
function generateCouponCode(length: number = 8): string {
  return randomBytes(length).toString('hex').slice(0, length).toUpperCase();
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

    // 관리자 권한 확인 (user_tp가 20인 경우 관리자로 간주)
    if (session.user.user_tp !== "20") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { 
      discount, 
      discount_type, 
      valid_days = 30, 
      user_id = "", 
      count = 1 
    } = await req.json();

    // 필수 필드 검증
    if (!discount || !discount_type) {
      return NextResponse.json(
        { error: "할인 금액과 할인 유형은 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    // 할인 유형 검증
    if (!["percentage", "fixed"].includes(discount_type)) {
      return NextResponse.json(
        { error: "할인 유형은 'percentage' 또는 'fixed'만 가능합니다." },
        { status: 400 }
      );
    }

    // 퍼센트 할인인 경우 0-100 사이의 값인지 확인
    if (discount_type === "percentage" && (discount <= 0 || discount > 100)) {
      return NextResponse.json(
        { error: "퍼센트 할인은 1에서 100 사이의 값이어야 합니다." },
        { status: 400 }
      );
    }

    // 고정 할인인 경우 양수인지 확인
    if (discount_type === "fixed" && discount <= 0) {
      return NextResponse.json(
        { error: "고정 할인은 0보다 큰 값이어야 합니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 사용자 ID가 제공된 경우 사용자 존재 여부 확인
    if (user_id) {
      const user = await User.findOne({ uid: user_id });
      if (!user) {
        return NextResponse.json(
          { error: "지정된 사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }
    }

    const valid_from = new Date();
    const valid_to = new Date();
    valid_to.setDate(valid_to.getDate() + valid_days);

    const coupons = [];

    // 요청된 수만큼 쿠폰 생성
    for (let i = 0; i < count; i++) {
      let code;
      let existingCoupon;
      
      // 고유한 쿠폰 코드 생성
      do {
        code = generateCouponCode();
        existingCoupon = await Coupon.findOne({ code });
      } while (existingCoupon);

      const coupon = await Coupon.create({
        code,
        discount,
        discount_type,
        valid_from,
        valid_to,
        is_used: false,
        user_id: user_id || "", // 사용자 ID가 없으면 빈 문자열로 설정
        create_dt: new Date(),
      });

      coupons.push(coupon);
    }

    return NextResponse.json(
      {
        status: "success",
        message: `${count}개의 쿠폰이 성공적으로 생성되었습니다.`,
        data: {
          coupons,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("쿠폰 생성 오류:", error);
    return NextResponse.json(
      { error: "쿠폰 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

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
    const is_used = url.searchParams.get("is_used");
    const user_id = url.searchParams.get("user_id");
    
    // 쿼리 조건 구성
    const query: any = {};
    
    if (is_used !== null) {
      query.is_used = is_used === "true";
    }
    
    if (user_id) {
      query.user_id = user_id;
    }

    // 쿠폰 목록 조회
    const coupons = await Coupon.find(query).sort({ create_dt: -1 });

    return NextResponse.json(
      {
        status: "success",
        data: {
          coupons,
          total: coupons.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("쿠폰 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "쿠폰 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 