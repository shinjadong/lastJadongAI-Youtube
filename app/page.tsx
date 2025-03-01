import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary">유튜브 영상 검색</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">로그인</Button>
            </Link>
            <Link href="/auth/register">
              <Button>회원가입</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              유튜브 영상 검색 및 분석 서비스
            </h1>
            <p className="mx-auto mt-6 max-w-[700px] text-gray-500 md:text-xl">
              키워드 검색, 영상 분석, 채널 분석 등 다양한 기능을 통해 유튜브 콘텐츠를 효과적으로 분석하세요.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/search">
                <Button size="lg" className="h-12 px-8">
                  지금 시작하기 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  요금제 보기
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="py-20 bg-muted">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
              주요 기능
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">키워드 검색</h3>
                <p className="text-muted-foreground">
                  관심 있는 키워드로 유튜브 영상을 검색하고 관련 데이터를 수집합니다.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">영상 분석</h3>
                <p className="text-muted-foreground">
                  조회수, 좋아요, 댓글 등 영상의 성과 지표를 분석합니다.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-3">채널 분석</h3>
                <p className="text-muted-foreground">
                  채널의 성장 추세, 구독자 수, 평균 조회수 등을 분석합니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} 유튜브 영상 검색. 모든 권리 보유.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              이용약관
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 