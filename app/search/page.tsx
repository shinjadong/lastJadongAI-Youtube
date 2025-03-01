"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export default function SearchPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      toast({
        title: "검색어를 입력하세요",
        description: "검색어를 입력한 후 검색 버튼을 클릭하세요.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    router.push(`/search/results?keyword=${encodeURIComponent(keyword.trim())}`);
  };

  if (status === "unauthenticated") {
    router.push("/auth/login");
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">유튜브 비디오 검색</h1>
          <p className="text-muted-foreground">
            키워드를 입력하여 유튜브 비디오를 검색하고 분석하세요.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>키워드 검색</CardTitle>
            <CardDescription>
              분석하고 싶은 유튜브 키워드를 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="검색어 입력 (예: CCTV 설치, 창업 아이템)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  "검색 중..."
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    검색
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">인기 검색어</h2>
          <div className="flex flex-wrap gap-2">
            {["CCTV설치", "창업아이템", "부업", "직장인창업", "무인창업", "기술창업"].map((tag) => (
              <Button
                key={tag}
                variant="outline"
                onClick={() => {
                  setKeyword(tag);
                  router.push(`/search/results?keyword=${encodeURIComponent(tag)}`);
                }}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 