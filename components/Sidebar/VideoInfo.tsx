"use client"

// 타입 임포트
import type { YouTubeVideo } from "@/types/youtube"

// UI 컴포넌트 임포트
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from "@/components/ui/hover-card"
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

// 아이콘 임포트
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Target, 
  MousePointerClick, 
  Timer,
  Loader2,
  AlertCircle,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Clock,
  MessageSquare,
  Tag
} from "lucide-react"

// 유틸리티 임포트
import { formatNumber, formatDate } from "@/lib/utils"

// 유틸리티 함수
const parseDuration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  
  return hours * 3600 + minutes * 60 + seconds;
};

const getPerformanceGrade = (rate: number) => {
  if (rate >= 80) return { grade: 'S', description: '매우 높은 영향력', color: 'primary' };
  if (rate >= 60) return { grade: 'A', description: '높은 영향력', color: 'primary' };
  if (rate >= 40) return { grade: 'B', description: '보통 영향력', color: 'secondary' };
  if (rate >= 20) return { grade: 'C', description: '낮은 영향력', color: 'secondary' };
  return { grade: 'D', description: '매우 낮은 영향력', color: 'destructive' };
};

const getContributionGrade = (rate: number) => {
  if (rate >= 150) return { grade: 'High', description: '매우 높은 기여도', color: 'primary' };
  if (rate >= 100) return { grade: 'Good', description: '높은 기여도', color: 'primary' };
  if (rate >= 70) return { grade: 'Medium', description: '보통 기여도', color: 'secondary' };
  if (rate >= 40) return { grade: 'Low', description: '낮은 기여도', color: 'destructive' };
  return { grade: 'Poor', description: '매우 낮은 기여도', color: 'destructive' };
};

interface VideoInfoProps {
  video: YouTubeVideo
  videoDetails?: any
}

export function VideoInfo({ video, videoDetails }: VideoInfoProps) {
  // 실제 데이터가 있으면 사용하고, 없으면 기존 데이터 사용
  const getVideoData = () => {
    if (videoDetails) {
      // 안전하게 데이터 추출
      const statistics = videoDetails.statistics || {};
      const snippet = videoDetails.snippet || {};
      
      return {
        title: snippet.title || "",
        views: Number(statistics.viewCount || 0),
        likes: 0, // YouTube API 정책 변경으로 좋아요 수를 제공하지 않을 수 있음
        comments: Number(statistics.commentCount || 0),
        publishDate: snippet.publishedAt || "",
        tags: snippet.tags || []
      };
    }
    
    return {
      title: video.snippet.title,
      views: Number(video.statistics?.viewCount || video.views || 0),
      likes: Number(video.statistics?.likeCount || 0),
      comments: Number(video.statistics?.commentCount || 0),
      publishDate: video.snippet.publishedAt || video.publishDate || '',
      tags: video.snippet.tags || []
    };
  };
  
  const videoData = getVideoData();

  const formatDuration = (duration?: string) => {
    if (!duration) return "00:00"
    const seconds = parseDuration(duration)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    const formatNumber = (num: number) => num.toString().padStart(2, "0")

    if (hours > 0) {
      return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(remainingSeconds)}`
    }
    return `${formatNumber(minutes)}:${formatNumber(remainingSeconds)}`
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="font-medium mb-4">비디오 정보</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">조회수: {formatNumber(videoData.views)}</span>
          </div>
          
          {videoData.likes > 0 && (
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">좋아요: {formatNumber(videoData.likes)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">댓글: {formatNumber(videoData.comments)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">게시일: {formatDate(videoData.publishDate)}</span>
          </div>
          
          {videoData.tags && videoData.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="h-4 w-4 text-muted-foreground mt-1" />
              <div className="flex-1">
                <span className="text-sm block mb-1">태그:</span>
                <div className="flex flex-wrap gap-1">
                  {videoData.tags.slice(0, 10).map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {videoData.tags.length > 10 && (
                    <Badge variant="outline" className="text-xs">
                      +{videoData.tags.length - 10}개 더
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 