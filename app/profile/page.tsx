"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, User, Mail, Phone, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";

const profileSchema = z.object({
  nickname: z.string().min(2, {
    message: "닉네임은 최소 2자 이상이어야 합니다.",
  }),
  phone: z.string().optional(),
  marketing_agree: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface UserData {
  uid: string;
  email: string;
  nickname: string;
  phone?: string;
  marketing_agree: string;
  user_tp: string;
  prod_tp: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: "",
      phone: "",
      marketing_agree: false,
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/auth/users");
      
      if (response.data.status === "success") {
        const user = response.data.data.user;
        setUserData(user);
        
        // 폼 초기값 설정
        form.reset({
          nickname: user.nickname,
          phone: user.phone || "",
          marketing_agree: user.marketing_agree === "Y",
        });
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

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const response = await axios.put("/api/auth/users", {
        nickname: data.nickname,
        phone: data.phone,
        marketing_agree: data.marketing_agree ? "Y" : "N",
      });

      if (response.data.status === "success") {
        toast({
          title: "프로필 업데이트 성공",
          description: "프로필 정보가 성공적으로 업데이트되었습니다.",
        });
        
        // 사용자 데이터 업데이트
        setUserData(response.data.data.user);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "프로필 업데이트 중 오류가 발생했습니다.";
      toast({
        title: "프로필 업데이트 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">프로필 설정</h1>
          <p className="text-muted-foreground">
            개인 정보 및 계정 설정을 관리하세요.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-lg">프로필 정보를 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>계정 정보</CardTitle>
                <CardDescription>
                  계정에 대한 기본 정보입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full p-3">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">이메일</p>
                    <p className="text-sm text-muted-foreground">
                      {userData?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full p-3">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">멤버십</p>
                    <p className="text-sm text-muted-foreground">
                      {getMembershipName(userData?.prod_tp || "10")}
                    </p>
                  </div>
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/membership")}
                  >
                    멤버십 관리
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>프로필 정보</CardTitle>
                <CardDescription>
                  프로필 정보를 업데이트하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="nickname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>닉네임</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="닉네임"
                                className="pl-10"
                                {...field}
                                disabled={isSaving}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>전화번호 (선택)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="01012345678"
                                className="pl-10"
                                {...field}
                                disabled={isSaving}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            전화번호는 선택 사항입니다.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="marketing_agree"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSaving}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>마케팅 정보 수신 동의</FormLabel>
                            <FormDescription>
                              이벤트 및 마케팅 정보를 수신합니다.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        "변경사항 저장"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 