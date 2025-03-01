import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { randomUUID } from "crypto";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("등록되지 않은 이메일입니다.");
        }

        const isPasswordValid = await user.comparePassword(credentials.password);

        if (!isPasswordValid) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }

        return {
          id: user._id.toString(),
          uid: user.uid,
          email: user.email,
          name: user.nickname,
          image: null,
          user_tp: user.user_tp,
          prod_tp: user.prod_tp,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && account.provider === "google" && user) {
        await connectToDatabase();
        
        // 구글 로그인 시 사용자 정보 확인 및 생성
        const existingUser = await User.findOne({ email: user.email });
        
        if (existingUser) {
          // 기존 사용자 정보 업데이트
          token.uid = existingUser.uid;
          token.user_tp = existingUser.user_tp;
          token.prod_tp = existingUser.prod_tp;
        } else {
          // 새 사용자 생성
          const newUser = await User.create({
            uid: randomUUID(),
            platform_id: user.id,
            email: user.email,
            nickname: user.name || '사용자',
            user_tp: '10', // 기본 사용자
            prod_tp: '10', // 기본 플랜
          });
          
          token.uid = newUser.uid;
          token.user_tp = newUser.user_tp;
          token.prod_tp = newUser.prod_tp;
        }
      }
      
      if (user) {
        token.uid = user.uid;
        token.user_tp = user.user_tp;
        token.prod_tp = user.prod_tp;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.uid = token.uid as string;
        session.user.user_tp = token.user_tp as string;
        session.user.prod_tp = token.prod_tp as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };