"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { 
  Loader2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Tag,
  Plus,
  AlertCircle,
  Calendar,
  Percent,
  DollarSign,
  User
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";

interface Coupon {
  _id: string;
  code: string;
  discount: number;
  discount_type: string;
  valid_from: string;
  valid_to: string;
  is_used: boolean;
  user_id: string;
  create_dt: string;
  user?: {
    email: string;
    nickname: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminCouponsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [usedFilter, setUsedFilter] = useState("all");
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // 쿠폰 생성 폼 상태
  const [newDiscount, setNewDiscount] = useState<number>(10);
  const [newDiscountType, setNewDiscountType] = useState<string>("percentage");
  const [newValidDays, setNewValidDays] = useState<number>(30);
  const [newUserId, setNewUserId] = useState<string>("");
  const [newCouponCount, setNewCouponCount] = useState<number>(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router, pagination?.page, usedFilter]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/api/auth/users");
      
      if (response.data.status === "success") {
        const user = response.data.data.user;
        
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
        
        // 쿠폰 목록 가져오기
        fetchCoupons();
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

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/coupons?page=${pagination.page}&limit=${pagination.limit}`;
      
      if (searchTerm) {
        url += `&code=${encodeURIComponent(searchTerm)}`;
      }
      
      if (usedFilter && usedFilter !== "all") {
        url += `&is_used=${usedFilter === "used"}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.status === "success") {
        setCoupons(response.data.data.coupons);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "쿠폰 목록을 불러오는 중 오류가 발생했습니다.";
      toast({
        title: "데이터 로드 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCoupons();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleCreateCoupon = async () => {
    setIsCreating(true);
    try {
      const response = await axios.post("/api/admin/coupons", {
        discount: newDiscount,
        discount_type: newDiscountType,
        valid_days: newValidDays,
        user_id: newUserId || undefined,
        count: newCouponCount
      });
      
      if (response.data.status === "success") {
        toast({
          title: "쿠폰 생성 성공",
          description: `${newCouponCount}개의 쿠폰이 성공적으로 생성되었습니다.`,
        });
        
        // 쿠폰 목록 새로고침
        fetchCoupons();
        setIsCreateDialogOpen(false);
        
        // 폼 초기화
        setNewDiscount(10);
        setNewDiscountType("percentage");
        setNewValidDays(30);
        setNewUserId("");
        setNewCouponCount(1);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "쿠폰 생성 중 오류가 발생했습니다.";
      toast({
        title: "쿠폰 생성 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 없음";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount}%`;
    } else {
      return `${coupon.discount.toLocaleString()}원`;
    }
  };

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">쿠폰 관리</h1>
            <p className="text-muted-foreground">
              시스템에 등록된 쿠폰을 관리합니다.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            쿠폰 생성
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>쿠폰 목록</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="쿠폰 코드 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-auto"
                  />
                  <Button type="submit" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={usedFilter} onValueChange={setUsedFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="사용 여부" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 쿠폰</SelectItem>
                      <SelectItem value="used">사용됨</SelectItem>
                      <SelectItem value="unused">미사용</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-lg">쿠폰 목록을 불러오는 중...</p>
                </div>
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium">쿠폰이 없습니다.</p>
                <p className="text-muted-foreground">
                  새 쿠폰을 생성해보세요.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>쿠폰 코드</TableHead>
                        <TableHead>할인</TableHead>
                        <TableHead>유효 기간</TableHead>
                        <TableHead>사용 여부</TableHead>
                        <TableHead>사용자</TableHead>
                        <TableHead>생성일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons.map((coupon) => (
                        <TableRow key={coupon._id}>
                          <TableCell className="font-medium">
                            {coupon.code}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {coupon.discount_type === "percentage" ? (
                                <Percent className="h-4 w-4 mr-1 text-muted-foreground" />
                              ) : (
                                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                              )}
                              {formatDiscount(coupon)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{formatDate(coupon.valid_from)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground ml-5">
                                ~ {formatDate(coupon.valid_to)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                coupon.is_used
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {coupon.is_used ? "사용됨" : "미사용"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {coupon.user_id ? (
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1 text-muted-foreground" />
                                {coupon.user ? (
                                  <div className="flex flex-col">
                                    <span className="text-sm">{coupon.user.nickname}</span>
                                    <span className="text-xs text-muted-foreground">{coupon.user.email}</span>
                                  </div>
                                ) : (
                                  <span>{coupon.user_id}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">미할당</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(coupon.create_dt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* 페이지네이션 */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    총 {pagination.total}개의 쿠폰 중 {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm">
                      {pagination.page} / {pagination.pages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 쿠폰 생성 다이얼로그 */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>쿠폰 생성</DialogTitle>
              <DialogDescription>
                새로운 쿠폰을 생성합니다. 할인 유형과 금액을 설정하세요.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">할인 유형</label>
                <Select value={newDiscountType} onValueChange={setNewDiscountType} disabled={isCreating}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="할인 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">퍼센트 할인 (%)</SelectItem>
                    <SelectItem value="fixed">금액 할인 (원)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">할인 {newDiscountType === "percentage" ? "비율" : "금액"}</label>
                <div className="col-span-3">
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(Number(e.target.value))}
                      min={1}
                      max={newDiscountType === "percentage" ? 100 : undefined}
                      disabled={isCreating}
                    />
                    <span className="ml-2">{newDiscountType === "percentage" ? "%" : "원"}</span>
                  </div>
                  {newDiscountType === "percentage" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      1에서 100 사이의 값을 입력하세요.
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">유효 기간</label>
                <div className="col-span-3">
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={newValidDays}
                      onChange={(e) => setNewValidDays(Number(e.target.value))}
                      min={1}
                      disabled={isCreating}
                    />
                    <span className="ml-2">일</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">사용자 ID</label>
                <Input
                  className="col-span-3"
                  placeholder="(선택) 특정 사용자에게 할당"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">생성 개수</label>
                <div className="col-span-3">
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={newCouponCount}
                      onChange={(e) => setNewCouponCount(Number(e.target.value))}
                      min={1}
                      max={100}
                      disabled={isCreating}
                    />
                    <span className="ml-2">개</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    한 번에 최대 100개까지 생성할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
                취소
              </Button>
              <Button onClick={handleCreateCoupon} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "생성"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
} 