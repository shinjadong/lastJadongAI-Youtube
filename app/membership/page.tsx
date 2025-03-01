"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Check, Loader2, CreditCard, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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

interface Coupon {
  _id: string;
  code: string;
  discount: number;
  discount_type: string;
  valid_from: string;
  valid_to: string;
  is_used: boolean;
  user_id: string;
}

export default function MembershipPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [membershipLimit, setMembershipLimit] = useState<MembershipLimit | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated") {
      fetchUserData();
      fetchCoupons();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/auth/users");
      
      if (response.data.status === "success") {
        setUserData(response.data.data.user);
        setMembershipLimit(response.data.data.membershipLimit);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "사용자 정보를 불러오는 중 오류가 발생했습니다.";
      toast({
        title: "데이터 로드 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await axios.get("/api/membership/coupons");
      
      if (response.data.status === "success") {
        setCoupons(response.data.data.coupons);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "쿠폰 정보를 불러오는 중 오류가 발생했습니다.";
      toast({
        title: "쿠폰 로드 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "쿠폰 코드 필요",
        description: "쿠폰 코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await axios.post("/api/membership/coupons", {
        code: couponCode.trim(),
      });
      
      if (response.data.status === "success") {
        toast({
          title: "쿠폰 적용 성공",
          description: "쿠폰이 성공적으로 적용되었습니다.",
        });
        
        // 쿠폰 목록 새로고침
        fetchCoupons();
        setCouponCode("");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "쿠폰 적용 중 오류가 발생했습니다.";
      toast({
        title: "쿠폰 적용 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleUpgrade = async (prodTp: string) => {
    setIsUpgrading(true);
    setSelectedPlan(prodTp);
    
    try {
      const payload: any = { prod_tp: prodTp };
      
      if (selectedCouponId) {
        payload.couponId = selectedCouponId;
      }
      
      const response = await axios.post("/api/membership/upgrade", payload);
      
      if (response.data.status === "success") {
        toast({
          title: "멤버십 업그레이드 성공",
          description: "멤버십이 성공적으로 업그레이드되었습니다.",
        });
        
        // 사용자 데이터 새로고침
        fetchUserData();
        fetchCoupons();
        setSelectedCouponId(null);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "멤버십 업그레이드 중 오류가 발생했습니다.";
      toast({
        title: "멤버십 업그레이드 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
      setSelectedPlan(null);
    }
  };

  const handleSelectCoupon = (couponId: string) => {
    setSelectedCouponId(selectedCouponId === couponId ? null : couponId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount}% 할인`;
    } else {
      return `${coupon.discount.toLocaleString()}원 할인`;
    }
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

  const isCurrentPlan = (prod_tp: string) => {
    return userData?.prod_tp === prod_tp;
  };

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">멤버십 관리</h1>
          <p className="text-muted-foreground">
            멤버십 플랜을 관리하고 업그레이드하세요.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-lg">멤버십 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="plans">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="plans">멤버십 플랜</TabsTrigger>
              <TabsTrigger value="coupons">쿠폰 관리</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plans" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                {/* 스타터 플랜 */}
                <Card className={isCurrentPlan("21") ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle>스타터 플랜</CardTitle>
                    <CardDescription>
                      유튜브 영상 검색을 시작하는 사용자를 위한 플랜
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold">₩19,900</span>
                      <span className="text-muted-foreground">/월</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>키워드 검색 {membershipLimit?.algorithm_use_count["21"]}회</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>채널 분석 {membershipLimit?.ca_channel_use_count["21"]}회</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>콘텐츠 분석 {membershipLimit?.ca_use_count["21"]}회</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>이메일 지원</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={isCurrentPlan("21") ? "outline" : "default"}
                      disabled={isCurrentPlan("21") || isUpgrading}
                      onClick={() => handleUpgrade("21")}
                    >
                      {isUpgrading && selectedPlan === "21" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isCurrentPlan("21")
                        ? "현재 플랜"
                        : "업그레이드"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* 프로 플랜 */}
                <Card className={isCurrentPlan("22") ? "border-primary" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>프로 플랜</CardTitle>
                        <CardDescription>
                          전문적인 유튜브 분석을 위한 플랜
                        </CardDescription>
                      </div>
                      <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                        인기
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold">₩39,900</span>
                      <span className="text-muted-foreground">/월</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>키워드 검색 {membershipLimit?.algorithm_use_count["22"]}회</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>채널 분석 {membershipLimit?.ca_channel_use_count["22"]}회</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>콘텐츠 분석 {membershipLimit?.ca_use_count["22"]}회</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>우선 이메일 지원</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>고급 분석 기능</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={isCurrentPlan("22") ? "outline" : "default"}
                      disabled={isCurrentPlan("22") || isUpgrading}
                      onClick={() => handleUpgrade("22")}
                    >
                      {isUpgrading && selectedPlan === "22" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isCurrentPlan("22")
                        ? "현재 플랜"
                        : "업그레이드"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* 엔터프라이즈 플랜 */}
                <Card className={isCurrentPlan("23") ? "border-primary" : ""}>
                  <CardHeader>
                    <CardTitle>엔터프라이즈 플랜</CardTitle>
                    <CardDescription>
                      대규모 유튜브 분석을 위한 플랜
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold">₩99,900</span>
                      <span className="text-muted-foreground">/월</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>키워드 검색 {membershipLimit?.algorithm_use_count["23"]}회</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>채널 분석 {membershipLimit?.ca_channel_use_count["23"]}회</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>콘텐츠 분석 {membershipLimit?.ca_use_count["23"]}회</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>전화 및 이메일 지원</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>모든 고급 기능</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>API 액세스</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={isCurrentPlan("23") ? "outline" : "default"}
                      disabled={isCurrentPlan("23") || isUpgrading}
                      onClick={() => handleUpgrade("23")}
                    >
                      {isUpgrading && selectedPlan === "23" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {isCurrentPlan("23")
                        ? "현재 플랜"
                        : "업그레이드"}
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>현재 멤버십</CardTitle>
                  <CardDescription>
                    현재 사용 중인 멤버십 정보입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">현재 플랜</p>
                        <p className="text-sm text-muted-foreground">
                          {getMembershipName(userData?.prod_tp || "10")}
                        </p>
                      </div>
                      {selectedCouponId && (
                        <div className="flex items-center space-x-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <span className="text-sm text-primary">쿠폰 적용됨</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">사용량</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">키워드 검색</p>
                          <p className="text-sm">
                            {userData?.algorithm_use_count || 0} / {membershipLimit?.algorithm_use_count[userData?.prod_tp || "10"] || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">채널 분석</p>
                          <p className="text-sm">
                            {userData?.ca_channel_use_count || 0} / {membershipLimit?.ca_channel_use_count[userData?.prod_tp || "10"] || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="coupons" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>쿠폰 등록</CardTitle>
                  <CardDescription>
                    쿠폰 코드를 입력하여 할인 혜택을 받으세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="쿠폰 코드 입력"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={isApplyingCoupon}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      적용
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>보유 쿠폰</CardTitle>
                  <CardDescription>
                    사용 가능한 쿠폰 목록입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {coupons.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">
                        사용 가능한 쿠폰이 없습니다.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {coupons.map((coupon) => (
                        <div
                          key={coupon._id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedCouponId === coupon._id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => handleSelectCoupon(coupon._id)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{formatDiscount(coupon)}</p>
                              <p className="text-sm text-muted-foreground">
                                {coupon.code}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                유효기간: {formatDate(coupon.valid_to)}까지
                              </p>
                            </div>
                            {selectedCouponId === coupon._id && (
                              <div className="bg-primary text-primary-foreground rounded-full p-1">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedCouponId(null)}
                    disabled={!selectedCouponId}
                  >
                    선택 취소
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
} 