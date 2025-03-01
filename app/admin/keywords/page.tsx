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
  ExternalLink,
  Trash2,
  AlertCircle
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

interface KeywordHistory {
  _id: string;
  keyword: string;
  status: string;
  round_no: string;
  level: number;
  uid: string;
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

export default function AdminKeywordsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [keywords, setKeywords] = useState<KeywordHistory[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordHistory | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router, pagination.page, statusFilter, levelFilter]);

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
        
        // 키워드 목록 가져오기
        fetchKeywords();
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

  const fetchKeywords = async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/histories/keyword?page=${pagination.page}&limit=${pagination.limit}`;
      
      if (searchTerm) {
        url += `&keyword=${encodeURIComponent(searchTerm)}`;
      }
      
      if (statusFilter && statusFilter !== "all") {
        url += `&status=${statusFilter}`;
      }
      
      if (levelFilter && levelFilter !== "all") {
        url += `&level=${levelFilter}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.status === "success") {
        setKeywords(response.data.data.keywords);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "키워드 목록을 불러오는 중 오류가 발생했습니다.";
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
    fetchKeywords();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteClick = (keyword: KeywordHistory) => {
    setSelectedKeyword(keyword);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteKeyword = async () => {
    if (!selectedKeyword) return;
    
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/api/admin/keywords/${selectedKeyword._id}`);
      
      if (response.data.status === "success") {
        toast({
          title: "키워드 삭제 성공",
          description: "키워드가 성공적으로 삭제되었습니다.",
        });
        
        // 키워드 목록 새로고침
        fetchKeywords();
        setIsDeleteDialogOpen(false);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "키워드 삭제 중 오류가 발생했습니다.";
      toast({
        title: "키워드 삭제 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusText = (status: string) => {
    return status === "1" ? "완료" : "진행중";
  };

  const getStatusClass = (status: string) => {
    return status === "1"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "날짜 없음";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">키워드 히스토리 관리</h1>
          <p className="text-muted-foreground">
            사용자들이 검색한 키워드 히스토리를 관리합니다.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>키워드 목록</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="키워드 검색"
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="상태 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 상태</SelectItem>
                      <SelectItem value="1">완료</SelectItem>
                      <SelectItem value="0">진행중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="레벨 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 레벨</SelectItem>
                      <SelectItem value="1">레벨 1</SelectItem>
                      <SelectItem value="2">레벨 2</SelectItem>
                      <SelectItem value="3">레벨 3</SelectItem>
                      <SelectItem value="4">레벨 4</SelectItem>
                      <SelectItem value="5">레벨 5</SelectItem>
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
                  <p className="mt-2 text-lg">키워드 목록을 불러오는 중...</p>
                </div>
              </div>
            ) : keywords.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium">키워드가 없습니다.</p>
                <p className="text-muted-foreground">
                  검색 조건을 변경해보세요.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>키워드</TableHead>
                        <TableHead>라운드</TableHead>
                        <TableHead>레벨</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>사용자</TableHead>
                        <TableHead>생성일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keywords.map((keyword) => (
                        <TableRow key={keyword._id}>
                          <TableCell className="font-medium">
                            {keyword.keyword}
                          </TableCell>
                          <TableCell>{keyword.round_no}</TableCell>
                          <TableCell>{keyword.level}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                                keyword.status
                              )}`}
                            >
                              {getStatusText(keyword.status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {keyword.user ? (
                              <div className="flex flex-col">
                                <span className="text-sm">{keyword.user.nickname}</span>
                                <span className="text-xs text-muted-foreground">{keyword.user.email}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">사용자 정보 없음</span>
                            )}
                          </TableCell>
                          <TableCell>{formatDate(keyword.create_dt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/search/results?round_no=${keyword.round_no}`)}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                결과 보기
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(keyword)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* 페이지네이션 */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    총 {pagination.total}개의 키워드 중 {(pagination.page - 1) * pagination.limit + 1}-
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

        {/* 키워드 삭제 다이얼로그 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>키워드 삭제</DialogTitle>
              <DialogDescription>
                이 키워드를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center p-4 bg-yellow-50 rounded-md">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-yellow-800">삭제할 키워드:</p>
                  <p className="text-yellow-700">
                    {selectedKeyword?.keyword} (라운드: {selectedKeyword?.round_no})
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteKeyword} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  "삭제"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
} 