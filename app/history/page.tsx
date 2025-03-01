"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Search, Loader2, ExternalLink, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";

interface KeywordHistory {
  _id: string;
  keyword: string;
  status: string;
  round_no: string;
  level: number;
  uid: string;
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [histories, setHistories] = useState<KeywordHistory[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<KeywordHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated") {
      fetchKeywordHistories();
    }
  }, [status, router]);

  useEffect(() => {
    filterHistories();
  }, [histories, searchTerm, statusFilter]);

  const fetchKeywordHistories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/contents/histories/keyword");
      
      if (response.data.status === "success") {
        setHistories(response.data.data.histories);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "키워드 기록을 불러오는 중 오류가 발생했습니다.";
      toast({
        title: "데이터 로드 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterHistories = () => {
    let filtered = [...histories];
    
    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(history => 
        history.keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 상태 필터링
    if (statusFilter !== "all") {
      filtered = filtered.filter(history => history.status === statusFilter);
    }
    
    setFilteredHistories(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterHistories();
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleViewResults = (round_no: string) => {
    router.push(`/search/results?round_no=${round_no}`);
  };

  const getStatusText = (status: string) => {
    return status === "1" ? "완료" : "진행중";
  };

  const getStatusClass = (status: string) => {
    return status === "1"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">검색 기록</h1>
          <p className="text-muted-foreground">
            이전에 검색한 키워드 목록입니다.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>키워드 검색 기록</CardTitle>
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
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-2 text-lg">검색 기록을 불러오는 중...</p>
                </div>
              </div>
            ) : filteredHistories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium">검색 기록이 없습니다.</p>
                <p className="text-muted-foreground">
                  새로운 키워드를 검색해보세요.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => router.push("/search")}
                >
                  <Search className="mr-2 h-4 w-4" />
                  새 검색
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>키워드</TableHead>
                      <TableHead>라운드</TableHead>
                      <TableHead>레벨</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistories.map((history) => (
                      <TableRow key={history._id}>
                        <TableCell className="font-medium">
                          {history.keyword}
                        </TableCell>
                        <TableCell>{history.round_no}</TableCell>
                        <TableCell>{history.level}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                              history.status
                            )}`}
                          >
                            {getStatusText(history.status)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResults(history.round_no)}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            결과 보기
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>새 키워드 검색</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              새로운 키워드를 검색하여 유튜브 영상을 분석해보세요.
            </p>
            <Button onClick={() => router.push("/search")}>
              <Search className="mr-2 h-4 w-4" />
              새 키워드 검색
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
} 