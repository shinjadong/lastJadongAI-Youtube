"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";

interface MembershipLimit {
  wt_use_count: Record<string, number>;
  ca_channel_count: Record<string, number>;
  ca_channel_use_count: Record<string, number>;
  ca_use_count: Record<string, number>;
  cm_use_count: Record<string, number>;
  km_use_count: Record<string, number>;
  algorithm_use_count: Record<string, number>;
}

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [membershipLimit, setMembershipLimit] = useState<MembershipLimit | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembershipData();
  }, [status]);

  const fetchMembershipData = async () => {
    setIsLoading(true);
    try {
      // 사용자 정보 가져오기
      if (status === "authenticated") {
        const response = await axios.get("/api/auth/users");
        if (response.data.status === "success") {
          const user = response.data.data.user;
          setCurrentPlan(user.prod_tp);
          setMembershipLimit(response.data.data.membershipLimit);
        }
      } else {
        // 비로그인 상태에서는 기본 멤버십 한도 정보만 가져옴
        const response = await axios.get("/api/membership/limits");
        if (response.data.status === "success") {
          setMembershipLimit(response.data.data.membershipLimit);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "멤버십 정보를 불러오는 중 오류가 발생했습니다.";
      toast({
        title: "데이터 로드 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = (planId: string) => {
    if (status !== "authenticated") {
      toast({
        title: "로그인 필요",
        description: "멤버십 업그레이드를 위해 로그인이 필요합니다.",
        variant: "destructive",
      });
      router.push("/auth/login");
      return;
    }

    // 결제 페이지로 이동 또는 결제 프로세스 시작
    router.push(`/payment?plan=${planId}`);
  };

  const getPlanName = (planId: string) => {
    switch (planId) {
      case "10":
        return "무료";
      case "21":
        return "베이직";
      case "22":
        return "프로";
      case "23":
        return "프리미엄";
      case "24":
        return "체험판";
      case "61":
        return "무제한";
      default:
        return "알 수 없음";
    }
  };

  const getPlanPrice = (planId: string) => {
    switch (planId) {
      case "10":
        return "0";
      case "21":
        return "29,000";
      case "22":
        return "49,000";
      case "23":
        return "99,000";
      case "24":
        return "0";
      case "61":
        return "문의";
      default:
        return "문의";
    }
  };

  const getPlanDescription = (planId: string) => {
    switch (planId) {
      case "10":
        return "기본 기능을 무료로 사용해보세요";
      case "21":
        return "개인 사용자를 위한 기본 플랜";
      case "22":
        return "전문가를 위한 고급 기능";
      case "23":
        return "비즈니스를 위한 모든 기능";
      case "24":
        return "프리미엄 기능을 체험해보세요";
      case "61":
        return "기업 맞춤형 무제한 플랜";
      default:
        return "";
    }
  };

  const getPlanFeatures = (planId: string) => {
    if (!membershipLimit) return [];

    return [
      `키워드 검색: ${membershipLimit.km_use_count[planId]}회`,
      `영상 분석: ${membershipLimit.wt_use_count[planId]}회`,
      `채널 분석: ${membershipLimit.ca_use_count[planId]}회`,
      `채널 등록: ${membershipLimit.ca_channel_count[planId]}개`,
      `알고리즘 분석: ${membershipLimit.algorithm_use_count[planId]}회`,
    ];
  };

  const plans = ["10", "21", "22", "23", "61"];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">멤버십 요금제</h1>
          <p className="text-muted-foreground mt-2">
            다양한 요금제 중에서 필요에 맞는 플랜을 선택하세요
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {plans.map((planId) => (
              <Card
                key={planId}
                className={`flex flex-col ${
                  currentPlan === planId ? "border-primary" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle>{getPlanName(planId)}</CardTitle>
                  <CardDescription>{getPlanDescription(planId)}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">₩{getPlanPrice(planId)}</span>
                    {planId !== "10" && planId !== "24" && planId !== "61" && (
                      <span className="text-muted-foreground">/월</span>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {getPlanFeatures(planId).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 mr-2 mt-1 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {currentPlan === planId ? (
                    <Button className="w-full" disabled>
                      현재 플랜
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(planId)}
                      variant={planId === "23" ? "default" : "outline"}
                    >
                      {planId === "61" ? "문의하기" : "업그레이드"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="bg-muted p-6 rounded-lg mt-12">
          <h2 className="text-xl font-bold mb-4">엔터프라이즈 플랜</h2>
          <p className="mb-4">
            대규모 팀이나 특별한 요구사항이 있으신가요? 맞춤형 엔터프라이즈 솔루션을 제공해 드립니다.
          </p>
          <Button variant="outline" onClick={() => router.push("/contact")}>
            문의하기
          </Button>
        </div>
      </div>
    </MainLayout>
  );
} 