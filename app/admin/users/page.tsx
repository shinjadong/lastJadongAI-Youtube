"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { 
  Loader2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Check,
  X,
  UserCog,
  Shield,
  UserPlus,
  Trash
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";

interface User {
  _id: string;
  uid: string;
  email: string;
  nickname: string;
  phone?: string;
  user_tp: string;
  prod_tp: string;
  membershipAskYn: string;
  membershipSuspended: boolean;
  create_dt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [membershipRequestFilter, setMembershipRequestFilter] = useState(
    searchParams.get("membershipAskYn") || "all"
  );
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newMembership, setNewMembership] = useState("");
  const [editUserType, setEditUserType] = useState("");
  const [newSuspendedStatus, setNewSuspendedStatus] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserNickname, setNewUserNickname] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserMembership, setNewUserMembership] = useState("10");
  const [newUserType, setNewUserType] = useState("10");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchUserData();
    }
  }, [status, router, pagination.page, membershipFilter, userTypeFilter, membershipRequestFilter]);

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
        
        // 사용자 목록 가져오기
        fetchUsers();
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

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/users?page=${pagination.page}&limit=${pagination.limit}`;
      
      if (searchTerm) {
        if (searchTerm.includes("@")) {
          url += `&email=${encodeURIComponent(searchTerm)}`;
        } else {
          url += `&nickname=${encodeURIComponent(searchTerm)}`;
        }
      }
      
      if (membershipFilter && membershipFilter !== "all") {
        url += `&prod_tp=${membershipFilter}`;
      }
      
      if (userTypeFilter && userTypeFilter !== "all") {
        url += `&user_tp=${userTypeFilter}`;
      }
      
      if (membershipRequestFilter && membershipRequestFilter !== "all") {
        url += `&membershipAskYn=${membershipRequestFilter}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.status === "success") {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "사용자 목록을 불러오는 중 오류가 발생했습니다.";
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
    fetchUsers();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setNewMembership(user.prod_tp);
    setEditUserType(user.user_tp);
    setNewSuspendedStatus(user.membershipSuspended);
    setIsDialogOpen(true);
  };

  const handleUserUpdate = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    try {
      const response = await axios.put("/api/admin/users", {
        uid: selectedUser.uid,
        prod_tp: newMembership,
        user_tp: editUserType,
        membershipSuspended: newSuspendedStatus,
      });
      
      if (response.data.status === "success") {
        toast({
          title: "사용자 업데이트 성공",
          description: "사용자 정보가 성공적으로 업데이트되었습니다.",
        });
        
        // 사용자 목록 새로고침
        fetchUsers();
        setIsDialogOpen(false);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "사용자 업데이트 중 오류가 발생했습니다.";
      toast({
        title: "사용자 업데이트 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
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

  const getUserTypeName = (user_tp: string) => {
    const userTypes: { [key: string]: string } = {
      "10": "일반 사용자",
      "20": "관리자",
    };
    return userTypes[user_tp] || "알 수 없음";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAddUser = () => {
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserNickname("");
    setNewUserPhone("");
    setNewUserMembership("10");
    setNewUserType("10");
    setIsAddDialogOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 필수 필드 검증
    if (!newUserEmail || !newUserPassword || !newUserNickname) {
      toast({
        title: "필수 정보 누락",
        description: "이메일, 비밀번호, 닉네임은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      const response = await axios.post("/api/admin/users", {
        email: newUserEmail,
        password: newUserPassword,
        nickname: newUserNickname,
        phone: newUserPhone || "",
        prod_tp: newUserMembership,
        user_tp: newUserType,
      });
      
      if (response.data.status === "success") {
        toast({
          title: "사용자 생성 성공",
          description: "사용자가 성공적으로 생성되었습니다.",
        });
        
        // 사용자 목록 새로고침
        fetchUsers();
        setIsAddDialogOpen(false);
      }
    } catch (error: any) {
      console.error("사용자 생성 오류:", error);
      const errorMessage =
        error.response?.data?.error || "사용자 생성 중 오류가 발생했습니다.";
      toast({
        title: "사용자 생성 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/api/admin/users?uid=${userToDelete.uid}`);
      
      if (response.data.status === "success") {
        toast({
          title: "사용자 삭제 성공",
          description: "사용자가 성공적으로 삭제되었습니다.",
        });
        
        // 사용자 목록 새로고침
        fetchUsers();
        setIsDeleteDialogOpen(false);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "사용자 삭제 중 오류가 발생했습니다.";
      toast({
        title: "사용자 삭제 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
            <h1 className="text-3xl font-bold tracking-tight">사용자 관리</h1>
            <p className="text-muted-foreground">
              시스템에 등록된 사용자를 관리합니다.
            </p>
          </div>
          <Button onClick={handleAddUser}>
            <UserPlus className="mr-2 h-4 w-4" />
            사용자 추가
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>사용자 목록</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="이메일 또는 닉네임 검색"
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
                  <Select value={membershipFilter} onValueChange={setMembershipFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="멤버십 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 멤버십</SelectItem>
                      <SelectItem value="10">기본 플랜</SelectItem>
                      <SelectItem value="21">스타터 플랜</SelectItem>
                      <SelectItem value="22">프로 플랜</SelectItem>
                      <SelectItem value="23">엔터프라이즈 플랜</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="사용자 유형" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 유형</SelectItem>
                      <SelectItem value="10">일반 사용자</SelectItem>
                      <SelectItem value="20">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={membershipRequestFilter} onValueChange={setMembershipRequestFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="멤버십 요청" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 상태</SelectItem>
                      <SelectItem value="Y">요청 있음</SelectItem>
                      <SelectItem value="N">요청 없음</SelectItem>
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
                  <p className="mt-2 text-lg">사용자 목록을 불러오는 중...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium">사용자가 없습니다.</p>
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
                        <TableHead>이메일</TableHead>
                        <TableHead>닉네임</TableHead>
                        <TableHead>멤버십</TableHead>
                        <TableHead>유형</TableHead>
                        <TableHead>가입일</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">
                            {user.email}
                          </TableCell>
                          <TableCell>{user.nickname}</TableCell>
                          <TableCell>{getMembershipName(user.prod_tp)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {user.user_tp === "20" && (
                                <Shield className="h-4 w-4 mr-1 text-primary" />
                              )}
                              {getUserTypeName(user.user_tp)}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(user.create_dt)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {user.membershipSuspended && (
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                                  정지됨
                                </span>
                              )}
                              {user.membershipAskYn === "Y" && (
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                                  멤버십 요청
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserEdit(user)}
                              >
                                <UserCog className="h-4 w-4 mr-2" />
                                관리
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(user)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                삭제
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
                    총 {pagination.total}명의 사용자 중 {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)}명 표시
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

        {/* 사용자 편집 다이얼로그 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>사용자 정보 수정</DialogTitle>
              <DialogDescription>
                {selectedUser?.email}의 정보를 수정합니다.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">멤버십</label>
                <Select value={newMembership} onValueChange={setNewMembership} disabled={isUpdating}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="멤버십 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">기본 플랜</SelectItem>
                    <SelectItem value="21">스타터 플랜</SelectItem>
                    <SelectItem value="22">프로 플랜</SelectItem>
                    <SelectItem value="23">엔터프라이즈 플랜</SelectItem>
                    <SelectItem value="24">체험 플랜</SelectItem>
                    <SelectItem value="25">무제한 플랜</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">사용자 유형</label>
                <Select value={editUserType} onValueChange={setEditUserType} disabled={isUpdating}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="사용자 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">일반 사용자</SelectItem>
                    <SelectItem value="20">관리자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm">계정 상태</label>
                <Select 
                  value={newSuspendedStatus ? "suspended" : "active"} 
                  onValueChange={(value) => setNewSuspendedStatus(value === "suspended")}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="계정 상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        <span>활성</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="suspended">
                      <div className="flex items-center">
                        <X className="h-4 w-4 mr-2 text-red-500" />
                        <span>정지</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedUser?.membershipAskYn === "Y" && (
                <div className="col-span-4 bg-yellow-50 p-3 rounded-md text-sm">
                  <p className="font-medium text-yellow-800">멤버십 업그레이드 요청이 있습니다.</p>
                  <p className="text-yellow-700">멤버십을 변경하면 요청이 자동으로 처리됩니다.</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUpdating}>
                취소
              </Button>
              <Button onClick={handleUserUpdate} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "저장"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 사용자 추가 다이얼로그 */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>새 사용자 추가</DialogTitle>
              <DialogDescription>
                새로운 사용자 계정을 생성합니다.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="email" className="text-right text-sm">이메일 *</label>
                  <Input
                    id="email"
                    className="col-span-3"
                    placeholder="이메일"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    disabled={isAdding}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="password" className="text-right text-sm">비밀번호 *</label>
                  <Input
                    id="password"
                    className="col-span-3"
                    placeholder="비밀번호"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    disabled={isAdding}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="nickname" className="text-right text-sm">닉네임 *</label>
                  <Input
                    id="nickname"
                    className="col-span-3"
                    placeholder="닉네임"
                    value={newUserNickname}
                    onChange={(e) => setNewUserNickname(e.target.value)}
                    disabled={isAdding}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="phone" className="text-right text-sm">전화번호</label>
                  <Input
                    id="phone"
                    className="col-span-3"
                    placeholder="전화번호 (선택)"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    disabled={isAdding}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="membership" className="text-right text-sm">멤버십</label>
                  <Select value={newUserMembership} onValueChange={setNewUserMembership} disabled={isAdding}>
                    <SelectTrigger id="membership" className="col-span-3">
                      <SelectValue placeholder="멤버십 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">기본 플랜</SelectItem>
                      <SelectItem value="21">스타터 플랜</SelectItem>
                      <SelectItem value="22">프로 플랜</SelectItem>
                      <SelectItem value="23">엔터프라이즈 플랜</SelectItem>
                      <SelectItem value="24">체험 플랜</SelectItem>
                      <SelectItem value="25">무제한 플랜</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="userType" className="text-right text-sm">사용자 유형</label>
                  <Select value={newUserType} onValueChange={setNewUserType} disabled={isAdding}>
                    <SelectTrigger id="userType" className="col-span-3">
                      <SelectValue placeholder="사용자 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">일반 사용자</SelectItem>
                      <SelectItem value="20">관리자</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isAdding}>
                  취소
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    "생성"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* 사용자 삭제 확인 다이얼로그 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>사용자 삭제</DialogTitle>
              <DialogDescription>
                정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="font-medium text-yellow-800">삭제할 사용자: {userToDelete?.email}</p>
                <p className="text-sm text-yellow-700 mt-1">
                  사용자 계정과 관련된 모든 데이터가 삭제됩니다.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser} disabled={isDeleting}>
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