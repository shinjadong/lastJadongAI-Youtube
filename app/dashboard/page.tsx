"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BarChart, Search, Clock, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";

interface UserData {
  uid: string;
  email: string;
  nickname: string;
  user_tp: string;
  prod_tp: string;
  algorithm_use_count: number;
  ca_channel_use_count: number;
  ca_use_count: number;
  cm_use_count: number;
  km_use_count: number;
}

interface MembershipLimit {
  algorithm_use_count: {
    [key: string]: number;
  };
  ca_channel_use_count: {
    [key: string]: number;
  };
  ca_use_count: {
    [key: string]: number;
  };
  cm_use_count: {
    [key: string]: number;
  };
  km_use_count: {
    [key: string]: number;
  };
}

interface KeywordHistory {
  _id: string;
  keyword: string;
  status: string;
  round_no: string;
  level: number;
  uid: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [membershipLimit, setMembershipLimit] = useState<MembershipLimit | null>(null);
  const [recentKeywords, setRecentKeywords] = useState<KeywordHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated") {
      fetchUserData();
      fetchKeywordHistory();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/auth/users");
      setUserData(response.data.data.user);
      setMembershipLimit(response.data.data.membershipLimit);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "사용자 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchKeywordHistory = async () => {
    try {
      const response = await axios.get("/api/contents/histories/keyword");
      setRecentKeywords(response.data.data.histories.slice(0, 5));
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "키워드 기록을 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const getMembershipName = (prod_tp: string) => {
    const membershipTypes: { [key: string]: string } = {
      "10": "기본 플랜",
      "20": "프리미엄 플랜",
      "21": "스타터 플랜",
      "22": "프로 플랜",
      "23": "엔터프라이즈 플랜",
      "24": "체험 플랜",
      "25": "무제한 플랜",
    };
    return membershipTypes[prod_tp] || "알 수 없음";
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg">로딩 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">
            {userData?.nickname}님, 환영합니다! 현재 멤버십은{" "}
            <span className="font-medium">{getMembershipName(userData?.prod_tp || "10")}</span>
            입니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">키워드 검색</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData?.algorithm_use_count || 0}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{
                    width: `${getUsagePercentage(
                      userData?.algorithm_use_count || 0,
                      membershipLimit?.algorithm_use_count?.[userData?.prod_tp || "10"] || 1
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userData?.algorithm_use_count || 0} /{" "}
                {membershipLimit?.algorithm_use_count?.[userData?.prod_tp || "10"] || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">채널 분석</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData?.ca_channel_use_count || 0}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{
                    width: `${getUsagePercentage(
                      userData?.ca_channel_use_count || 0,
                      membershipLimit?.ca_channel_use_count?.[userData?.prod_tp || "10"] || 1
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userData?.ca_channel_use_count || 0} /{" "}
                {membershipLimit?.ca_channel_use_count?.[userData?.prod_tp || "10"] || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">콘텐츠 분석</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData?.ca_use_count || 0}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{
                    width: `${getUsagePercentage(
                      userData?.ca_use_count || 0,
                      membershipLimit?.ca_use_count?.[userData?.prod_tp || "10"] || 1
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userData?.ca_use_count || 0} /{" "}
                {membershipLimit?.ca_use_count?.[userData?.prod_tp || "10"] || 0}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">콘텐츠 모니터링</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userData?.cm_use_count || 0}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{
                    width: `${getUsagePercentage(
                      userData?.cm_use_count || 0,
                      membershipLimit?.cm_use_count?.[userData?.prod_tp || "10"] || 1
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userData?.cm_use_count || 0} /{" "}
                {membershipLimit?.cm_use_count?.[userData?.prod_tp || "10"] || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>최근 검색 키워드</CardTitle>
              <CardDescription>
                최근에 검색한 키워드 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentKeywords.length > 0 ? (
                <div className="space-y-4">
                  {recentKeywords.map((keyword) => (
                    <div
                      key={keyword._id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {keyword.keyword}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            라운드: {keyword.round_no}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            keyword.status === "1"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {keyword.status === "1" ? "완료" : "진행중"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">검색 기록이 없습니다.</p>
                </div>
              )}

              <div className="mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/history")}
                >
                  모든 검색 기록 보기
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>빠른 액세스</CardTitle>
              <CardDescription>
                자주 사용하는 기능에 빠르게 접근하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1">
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push("/search")}
                >
                  <Search className="mr-2 h-4 w-4" />
                  새 키워드 검색
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/history")}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  검색 기록 보기
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/membership")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  멤버십 관리
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push("/profile")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  프로필 설정
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 