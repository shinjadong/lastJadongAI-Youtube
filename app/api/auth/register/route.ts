import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, password, nickname, phone, marketing_agree } = await req.json();

    // 필수 필드 검증
    if (!email || !password || !nickname) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 닉네임은 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 409 }
      );
    }

    // username 중복 확인
    const existingUsername = await User.findOne({ username: nickname });
    if (existingUsername) {
      return NextResponse.json(
        { error: "이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요." },
        { status: 409 }
      );
    }

    // 사용자 생성
    const newUser = await User.create({
      uid: randomUUID(),
      email,
      password,
      nickname,
      username: nickname, // 닉네임을 username으로 사용
      phone: phone || "",
      marketing_agree: marketing_agree || "N",
      user_tp: "10", // 기본 사용자
      prod_tp: "10", // 기본 플랜
      pt_yn: "N",
      help_yn: "Y",
      loyalty_yn: "N",
      country: "KR",
      lang: "ko",
      membershipSuspended: false,
      membershipAskYn: "N",
      dormant_account_yn: "N",
      create_user: email,
      update_user: email,
    });

    // 비밀번호 제외하고 사용자 정보 반환
    const user = newUser.toObject();
    delete user.password;

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다.", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("회원가입 오류:", error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 