import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import { User, MembershipLimit } from "@/models";
import { authOptions } from "../[...nextauth]/route";

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

    // 사용자 정보 조회
    const user = await User.findOne({ uid: session.user.uid }).select("-password");

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 멤버십 제한 정보 조회
    const membershipLimit = await MembershipLimit.findOne();

    // 쿠폰 정보는 현재 구현하지 않음
    const coupon = {};

    return NextResponse.json(
      {
        status: "success",
        data: {
          user,
          membershipLimit,
          coupon,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("사용자 정보 조회 오류:", error);
    return NextResponse.json(
      { error: "사용자 정보 조회 중 오류가 발생했습니다." },
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

    const { nickname, phone, marketing_agree } = await req.json();

    await connectToDatabase();

    // 사용자 정보 업데이트
    const updatedUser = await User.findOneAndUpdate(
      { uid: session.user.uid },
      {
        $set: {
          nickname: nickname,
          phone: phone,
          marketing_agree: marketing_agree,
          update_dt: new Date(),
        },
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        data: {
          user: updatedUser,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("사용자 정보 업데이트 오류:", error);
    return NextResponse.json(
      { error: "사용자 정보 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 