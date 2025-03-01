import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

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
    const email = url.searchParams.get("email");
    const nickname = url.searchParams.get("nickname");
    const prod_tp = url.searchParams.get("prod_tp");
    const membershipAskYn = url.searchParams.get("membershipAskYn");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    
    // 쿼리 조건 구성
    const query: any = {};
    
    if (email) {
      query.email = { $regex: email, $options: "i" };
    }
    
    if (nickname) {
      query.nickname = { $regex: nickname, $options: "i" };
    }
    
    if (prod_tp) {
      query.prod_tp = prod_tp;
    }
    
    if (membershipAskYn) {
      query.membershipAskYn = membershipAskYn;
    }

    // 페이지네이션 계산
    const skip = (page - 1) * limit;
    
    // 사용자 목록 조회
    const users = await User.find(query)
      .select("-password")
      .sort({ create_dt: -1 })
      .skip(skip)
      .limit(limit);
    
    // 전체 사용자 수 조회
    const total = await User.countDocuments(query);

    return NextResponse.json(
      {
        status: "success",
        data: {
          users,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("사용자 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "사용자 목록 조회 중 오류가 발생했습니다." },
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

    // 관리자 권한 확인
    if (session.user.user_tp !== "20") {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { uid, prod_tp, membershipSuspended, user_tp } = await req.json();

    if (!uid) {
      return NextResponse.json(
        { error: "사용자 ID는 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 업데이트할 필드 구성
    const updateFields: any = {};
    
    if (prod_tp !== undefined) {
      updateFields.prod_tp = prod_tp;
      // 멤버십이 업그레이드되면 요청 상태 초기화
      updateFields.membershipAskYn = "N";
    }
    
    if (membershipSuspended !== undefined) {
      updateFields.membershipSuspended = membershipSuspended;
    }
    
    if (user_tp !== undefined) {
      updateFields.user_tp = user_tp;
    }

    // 사용자 정보 업데이트
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { $set: updateFields },
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
        message: "사용자 정보가 성공적으로 업데이트되었습니다.",
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

export async function POST(req: NextRequest) {
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

    const { email, password, nickname, phone, user_tp, prod_tp } = await req.json();

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

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 사용자 생성
    const newUser = await User.create({
      uid: randomUUID(),
      email,
      password: hashedPassword,
      nickname,
      username: nickname,
      phone: phone || "",
      user_tp: user_tp || "10", // 기본값: 일반 사용자
      prod_tp: prod_tp || "10", // 기본값: 기본 플랜
      membershipAskYn: "N",
      membershipSuspended: false,
      marketing_agree: "N",
      pt_yn: "N",
      help_yn: "Y",
      loyalty_yn: "N",
      country: "KR",
      lang: "ko",
      dormant_account_yn: "N",
      create_dt: new Date(),
      create_user: session.user.email,
      update_user: session.user.email,
    });

    // 비밀번호 제외하고 사용자 정보 반환
    const user = newUser.toObject();
    delete user.password;

    return NextResponse.json(
      {
        status: "success",
        message: "사용자가 성공적으로 생성되었습니다.",
        data: {
          user,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("사용자 생성 오류:", error);
    return NextResponse.json(
      { error: "사용자 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    const url = new URL(req.url);
    const uid = url.searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { error: "사용자 ID는 필수 입력 항목입니다." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 자신을 삭제하려는 경우 방지
    if (uid === session.user.uid) {
      return NextResponse.json(
        { error: "자신의 계정은 삭제할 수 없습니다." },
        { status: 403 }
      );
    }

    // 사용자 삭제
    const result = await User.findOneAndDelete({ uid });

    if (!result) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "success",
        message: "사용자가 성공적으로 삭제되었습니다.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("사용자 삭제 오류:", error);
    return NextResponse.json(
      { error: "사용자 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 