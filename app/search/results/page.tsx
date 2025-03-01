"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { 
  BarChart2, 
  ThumbsUp, 
  Eye, 
  Calendar, 
  Clock, 
  Filter, 
  ArrowUpDown,
  Loader2,
  ExternalLink,
  Search,
  LayoutGrid,
  LayoutList,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import MainLayout from "@/components/layout/MainLayout";
import { useToast } from "@/components/ui/use-toast";
import { formatNumber } from "@/lib/utils";
import { VideoList } from "@/components/video";
import { Sidebar } from "@/components/Sidebar";
import { convertToYouTubeVideo } from "@/types/youtube";
import type { YouTubeVideo } from "@/types/youtube";
import { searchVideos } from "@/lib/youtube";
import { VideoFilter, VideoFilterValues } from "@/components/video/VideoFilter";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GridView } from "@/components/video/GridView";
import { ListView } from "@/components/video/ListView";

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
}

interface KeywordHistory {
  _id: string;
  keyword: string;
  round_no: string;
  status: string;
  level: number;
}

export default function SearchResultsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [history, setHistory] = useState<KeywordHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("views");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<VideoFilterValues>({
    viewsRange: [0, 1000000],
    subscribersRange: [0, 1000000],
    publishDateRange: { from: null, to: null },
    hookIndex: ["Good", "Normal", "Bad", "Worst"],
    growthIndex: ["Good", "Normal", "Bad", "Worst"],
    videoType: ["shorts", "longform"]
  });
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  const round_no = searchParams.get("round_no");
  const keyword = searchParams.get("keyword");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated") {
      if (round_no) {
        fetchVideosByRound();
      } else if (keyword) {
        fetchVideosByKeyword();
      }
    }
  }, [status, round_no, keyword, router]);

  const fetchVideosByRound = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/contents/videos?round_no=${round_no}`);
      
      if (response.data.status === "success") {
        setVideos(response.data.data.videos);
        setHistory(response.data.data.history);
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

  const fetchVideosByKeyword = async () => {
    if (!keyword) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/contents/videos/search`, {
        params: {
          keyword,
          maxResults: 20,
          pageToken: ""
        }
      });
      
      if (response.data.status === "success") {
        setVideos(response.data.data.videos);
        setNextPageToken(response.data.data.nextPageToken);
        setTotalResults(response.data.data.totalResults);
        setHistory({
          _id: "search",
          keyword: keyword,
          round_no: "search",
          status: "1",
          level: 1
        });
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "검색 결과를 불러오는 중 오류가 발생했습니다.";
      toast({
        title: "검색 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreResults = async () => {
    if (!keyword || !nextPageToken) return;
    
    try {
      const response = await axios.get(`/api/contents/videos/search`, {
        params: {
          keyword,
          maxResults: 20,
          pageToken: nextPageToken
        }
      });
      
      if (response.data.status === "success") {
        setVideos(prevVideos => [...prevVideos, ...response.data.data.videos]);
        setNextPageToken(response.data.data.nextPageToken);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "추가 결과를 불러오는 중 오류가 발생했습니다.";
      toast({
        title: "데이터 로드 실패",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    
    const sortedVideos = [...videos];
    switch (value) {
      case "views":
        sortedVideos.sort((a, b) => b.views - a.views);
        break;
      case "subscribers":
        sortedVideos.sort((a, b) => b.subscribers - a.subscribers);
        break;
      case "date":
        sortedVideos.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        break;
      case "duration":
        sortedVideos.sort((a, b) => {
          const durationA = convertDurationToSeconds(a.duration);
          const durationB = convertDurationToSeconds(b.duration);
          return durationB - durationA;
        });
        break;
      default:
        break;
    }
    
    setVideos(sortedVideos);
  };

  const handleFilterChange = (filters: VideoFilterValues) => {
    setActiveFilters(filters);
    setIsFilterOpen(false);
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video);
  };

  const handleCloseSidebar = () => {
    setSelectedVideo(null);
  };

  const convertDurationToSeconds = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || "0", 10);
    const minutes = parseInt(match[2] || "0", 10);
    const seconds = parseInt(match[3] || "0", 10);
    
    return hours * 3600 + minutes * 60 + seconds;
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
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const filteredVideos = videos.filter((video) => {
    // 조회수 필터
    const views = Number(video.views || 0);
    if (views < activeFilters.viewsRange[0] || views > activeFilters.viewsRange[1]) {
      return false;
    }

    // 구독자 수 필터
    const subscribers = Number(video.subscribers || 0);
    if (subscribers < activeFilters.subscribersRange[0] || subscribers > activeFilters.subscribersRange[1]) {
      return false;
    }

    // 게시일 필터
    if (activeFilters.publishDateRange.from || activeFilters.publishDateRange.to) {
      const publishDate = new Date(video.publishDate);
      if (activeFilters.publishDateRange.from && publishDate < activeFilters.publishDateRange.from) {
        return false;
      }
      if (activeFilters.publishDateRange.to && publishDate > activeFilters.publishDateRange.to) {
        return false;
      }
    }

    // 후킹지수 필터 (performance)
    if (!activeFilters.hookIndex.includes(video.performance)) {
      return false;
    }

    // 성장지수 필터 (contribution)
    if (!activeFilters.growthIndex.includes(video.contribution)) {
      return false;
    }

    // 비디오 타입 필터
    const isShort = video.duration ? 
      video.duration.includes("PT") && 
      !video.duration.includes("H") && 
      (!video.duration.includes("M") || parseInt(video.duration.match(/PT(\d+)M/)?.[1] || "0", 10) < 1) && 
      parseInt(video.duration.match(/PT(?:\d+M)?(\d+)S/)?.[1] || "0", 10) <= 60 : 
      false;
    
    const videoType = isShort ? "shorts" : "longform";
    if (!activeFilters.videoType.includes(videoType)) {
      return false;
    }

    return true;
  });

  // 정렬 로직
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === "views") {
      return Number(b.views || 0) - Number(a.views || 0);
    } else if (sortBy === "date") {
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    } else if (sortBy === "subscribers") {
      return Number(b.subscribers || 0) - Number(a.subscribers || 0);
    } else if (sortBy === "duration") {
      const durationA = convertDurationToSeconds(a.duration);
      const durationB = convertDurationToSeconds(b.duration);
      return durationB - durationA;
    }
    return 0;
  });

  const youtubeVideos = filteredVideos.map(video => convertToYouTubeVideo(video));

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">검색 결과</h1>
            {history && (
              <p className="text-muted-foreground">
                키워드: <span className="font-medium">{history.keyword}</span>
                {history.round_no !== "search" && ` (라운드: ${history.round_no})`}
              </p>
            )}
            {totalResults > 0 && (
              <p className="text-sm text-muted-foreground">
                총 {totalResults}개의 결과 중 {videos.length}개 표시
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-2" />
                  필터
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">필터 옵션</h3>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsFilterOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <VideoFilter onFilterChange={handleFilterChange} />
              </SheetContent>
            </Sheet>
            
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              그리드
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8"
            >
              <LayoutList className="h-4 w-4 mr-2" />
              리스트
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={sortBy === "views" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("views")}
            className="h-8"
          >
            조회수순
          </Button>
          <Button
            variant={sortBy === "date" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("date")}
            className="h-8"
          >
            최신순
          </Button>
          <Button
            variant={sortBy === "subscribers" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("subscribers")}
            className="h-8"
          >
            구독자순
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-lg">검색 결과를 불러오는 중...</p>
            </div>
          </div>
        ) : sortedVideos.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <p className="text-lg font-medium">검색 결과가 없습니다.</p>
              <p className="text-muted-foreground">다른 키워드로 검색해보세요.</p>
              <Button 
                className="mt-4" 
                onClick={() => router.push("/search")}
              >
                <Search className="h-4 w-4 mr-2" />
                새 검색
              </Button>
            </CardContent>
          </Card>
        ) : (
          viewMode === "grid" ? (
            <GridView videos={sortedVideos} onVideoSelect={handleVideoSelect} />
          ) : (
            <ListView videos={sortedVideos} onVideoSelect={handleVideoSelect} />
          )
        )}

        {nextPageToken && (
          <div className="flex justify-center mt-6">
            <Button onClick={loadMoreResults}>
              더 보기
            </Button>
          </div>
        )}

        {selectedVideo && (
          <Sidebar 
            video={selectedVideo} 
            onClose={handleCloseSidebar} 
          />
        )}
      </div>
    </MainLayout>
  );
} 
