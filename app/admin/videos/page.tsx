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
  AlertCircle,
  Eye,
  ThumbsUp
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
import { formatNumber } from "@/lib/utils";

interface Video {
  _id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: number;
  subscribers: number;
  contribution: string;
  performance: string;
  exposureProbability: number;
  totalVideos: number;
  publishDate: string;
  channelId: string;
  channelTitle: string;
  keyword: string;
  round_no: string;
  uid: string;
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

export default function AdminVideosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [contributionFilter, setContributionFilter] = useState("all");
  const [performanceFilter, setPerformanceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("views");
  
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
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
  }, [status, router, pagination.page, contributionFilter, performanceFilter, sortBy]);

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
        
        // 비디오 목록 가져오기
        fetchVideos();
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

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/videos?page=${pagination.page}&limit=${pagination.limit}&sort=${sortBy}`;
      
      if (searchTerm) {
        url += `&title=${encodeURIComponent(searchTerm)}`;
      }
      
      if (contributionFilter && contributionFilter !== "all") {
        url += `&contribution=${contributionFilter}`;
      }
      
      if (performanceFilter && performanceFilter !== "all") {
        url += `&performance=${performanceFilter}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.status === "success") {
        setVideos(response.data.data.videos);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "비디오 목록을 불러오는 중 오류가 발생했습니다.";
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
    fetchVideos();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleDeleteClick = (video: Video) => {
    setSelectedVideo(video);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;
    
    setIsDeleting(true);
    try {
      const response = await axios.delete(`/api/admin/videos/${selectedVideo._id}`);
      
      if (response.data.status === "success") {
        toast({
          title: "비디오 삭제 성공",
          description: "비디오가 성공적으로 삭제되었습니다.",
        });
        
        // 비디오 목록 새로고침
        fetchVideos();
        setIsDeleteDialogOpen(false);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "비디오 삭제 중 오류가 발생했습니다.";
      toast({
        title: "비디오 삭제 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getContributionColor = (contribution: string) => {
    switch (contribution) {
      case "Good":
        return "text-green-600";
      case "Normal":
        return "text-blue-600";
      case "Bad":
        return "text-yellow-600";
      case "Worst":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "Good":
        return "text-green-600";
      case "Normal":
        return "text-blue-600";
      case "Bad":
        return "text-yellow-600";
      case "Worst":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "00:00";
    
    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const seconds = match[3] ? parseInt(match[3], 10) : 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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

  const getContributionText = (contribution: string) => {
    switch (contribution) {
      case "Good":
        return "좋음";
      case "Normal":
        return "보통";
      case "Bad":
        return "나쁨";
      case "Worst":
        return "최악";
      default:
        return contribution;
    }
  };

  const getPerformanceText = (performance: string) => {
    switch (performance) {
      case "Good":
        return "좋음";
      case "Normal":
        return "보통";
      case "Bad":
        return "나쁨";
      case "Worst":
        return "최악";
      default:
        return performance;
    }
  };

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">비디오 관리</h1>
          <p className="text-muted-foreground">
            시스템에 등록된 유튜브 비디오를 관리합니다.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>비디오 목록</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <form onSubmit={handleSearch} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="제목 검색"
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
                  <Select value={contributionFilter} onValueChange={setContributionFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="기여도 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 기여도</SelectItem>
                      <SelectItem value="Good">좋음</SelectItem>
                      <SelectItem value="Normal">보통</SelectItem>
                      <SelectItem value="Bad">나쁨</SelectItem>
                      <SelectItem value="Worst">최악</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="성과도 필터" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">모든 성과도</SelectItem>
                      <SelectItem value="Good">좋음</SelectItem>
                      <SelectItem value="Normal">보통</SelectItem>
                      <SelectItem value="Bad">나쁨</SelectItem>
                      <SelectItem value="Worst">최악</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="정렬 기준" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="views">조회수</SelectItem>
                      <SelectItem value="subscribers">구독자 수</SelectItem>
                      <SelectItem value="publishDate">업로드 날짜</SelectItem>
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
                  <p className="mt-2 text-lg">비디오 목록을 불러오는 중...</p>
                </div>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg font-medium">비디오가 없습니다.</p>
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
                        <TableHead>썸네일</TableHead>
                        <TableHead>제목</TableHead>
                        <TableHead>채널</TableHead>
                        <TableHead>조회수</TableHead>
                        <TableHead>업로드 날짜</TableHead>
                        <TableHead>기여도/성과도</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {videos.map((video) => (
                        <TableRow key={video._id}>
                          <TableCell>
                            <div className="relative w-24 h-14 overflow-hidden rounded">
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // 이미지 로드 실패 시 기본 이미지로 대체
                                  e.currentTarget.src = "https://via.placeholder.com/120x68?text=No+Image";
                                }}
                              />
                              <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white px-1 py-0.5 rounded text-xs">
                                {formatDuration(video.duration)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {video.title}
                          </TableCell>
                          <TableCell>{video.channelTitle}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{formatNumber(video.views)}</span>
                              </div>
                              <div className="flex items-center">
                                <ThumbsUp className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span>{formatNumber(video.subscribers)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(video.publishDate)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center">
                                <span className="text-xs text-muted-foreground mr-1">기여도:</span>
                                <span className={`text-xs font-medium ${getContributionColor(video.contribution)}`}>
                                  {getContributionText(video.contribution)}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-xs text-muted-foreground mr-1">성과도:</span>
                                <span className={`text-xs font-medium ${getPerformanceColor(video.performance)}`}>
                                  {getPerformanceText(video.performance)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, "_blank")}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                보기
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteClick(video)}
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
                    총 {pagination.total}개의 비디오 중 {(pagination.page - 1) * pagination.limit + 1}-
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

        {/* 비디오 삭제 다이얼로그 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>비디오 삭제</DialogTitle>
              <DialogDescription>
                이 비디오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center p-4 bg-yellow-50 rounded-md">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-yellow-800">삭제할 비디오:</p>
                  <p className="text-yellow-700 truncate max-w-[300px]">
                    {selectedVideo?.title}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                취소
              </Button>
              <Button variant="destructive" onClick={handleDeleteVideo} disabled={isDeleting}>
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