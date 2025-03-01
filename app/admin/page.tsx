"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { 
  Users, 
  Search, 
  Tag, 
  BarChart2, 
  Loader2,
  UserPlus,
  History,
  Video
} from "lucide-react";

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
}

interface AdminStats {
  totalUsers: number;
  totalKeywords: number;
  totalVideos: number;
  totalCoupons: number;
  membershipRequests: number;
  recentUsers: Array<{
    _id: string;
    email: string;
    nickname: string;
    create_dt: string;
  }>;
  recentKeywords: Array<{
    _id: string;
    keyword: string;
    uid: string;
    create_dt: string;
  }>;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalKeywords: 0,
    totalVideos: 0,
    totalCoupons: 0,
    membershipRequests: 0,
    recentUsers: [],
    recentKeywords: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/auth/users");
      
      if (response.data.status === "success") {
        const user = response.data.data.user;
        setUserData(user);
        
        // 관리자 권한 확인
        if (user.user_tp !== "20") {
          toast({
            title: "접근 권한 없음",
            description: "관리자만 접근할 수 있는 페이지입니다.",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }
        
        // 관리자 통계 데이터 가져오기
        fetchAdminStats();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "사용자 정보를 불러오는 중 오류가 발생했습니다.";
      toast({
        title: "데이터 로드 실패",
        description: errorMessage,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const response = await axios.get("/api/admin/stats");
      
      if (response.data.status === "success") {
        setStats(response.data.data);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "통계 정보를 불러오는 중 오류가 발생했습니다.";
      toast({
        title: "통계 데이터 로드 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "unauthenticated") {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-lg">관리자 정보를 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (userData?.user_tp !== "20") {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-2xl font-bold mb-4">접근 권한 없음</h1>
          <p className="text-muted-foreground mb-6">
            관리자만 접근할 수 있는 페이지입니다.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            대시보드로 돌아가기
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
          <p className="text-muted-foreground">
            시스템 관리 및 사용자 데이터를 확인하세요.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                전체 등록된 사용자 수
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">키워드 검색</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalKeywords}</div>
              <p className="text-xs text-muted-foreground">
                전체 검색된 키워드 수
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">비디오</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVideos}</div>
              <p className="text-xs text-muted-foreground">
                전체 분석된 비디오 수
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">쿠폰</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCoupons}</div>
              <p className="text-xs text-muted-foreground">
                활성화된 쿠폰 수
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>관리자 기능</CardTitle>
              <CardDescription>
                시스템 관리를 위한 주요 기능입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push("/admin/users")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  사용자 관리
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push("/admin/keywords")}
                >
                  <History className="mr-2 h-4 w-4" />
                  키워드 히스토리 관리
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push("/admin/videos")}
                >
                  <Video className="mr-2 h-4 w-4" />
                  비디오 관리
                </Button>
                <Button
                  className="w-full justify-start"
                  onClick={() => router.push("/admin/coupons")}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  쿠폰 관리
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>멤버십 요청</CardTitle>
              <CardDescription>
                처리가 필요한 멤버십 요청입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{stats.membershipRequests}개의 요청</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push("/admin/users?membershipAskYn=Y")}
                  >
                    확인하기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>최근 가입 사용자</CardTitle>
              <CardDescription>
                최근에 가입한 사용자 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentUsers && stats.recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.nickname}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(user.create_dt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">최근 가입한 사용자가 없습니다.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 검색 키워드</CardTitle>
              <CardDescription>
                최근에 검색된 키워드 목록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.recentKeywords && stats.recentKeywords.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentKeywords.map((keyword) => (
                    <div key={keyword._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{keyword.keyword}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(keyword.create_dt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">최근 검색된 키워드가 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 