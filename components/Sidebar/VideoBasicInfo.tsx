/**
 * 비디오 기본 정보 표시 컴포넌트
 * 
 * 비디오의 기본적인 메타데이터를 표시하는 카드 컴포넌트입니다.
 * 다음과 같은 정보를 포함합니다:
 * 
 * - 썸네일 이미지 (고화질)
 * - 비디오 제목
 * - 채널 정보 (썸네일, 이름)
 * - 업로드 날짜
 * - 비디오 설명
 * - 태그 목록
 * - 기본 통계 (조회수, 좋아요, 댓글 수)
 * - 비디오 길이
 * 
 * 모든 텍스트는 적절히 말줄임 처리되며,
 * 통계 데이터는 포맷팅되어 표시됩니다.
 * 
 * @component
 * @param {Object} props
 * @param {YouTubeVideo} props.video - 표시할 비디오 데이터
 */

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
  AlertCircle
} from "lucide-react"

// 유틸리티 임포트
import { 
  formatNumber, 
  formatDate, 
  parseDuration,
} from "@/lib/utils"

interface VideoBasicInfoProps {
  video: YouTubeVideo
}

export function VideoBasicInfo({ video }: VideoBasicInfoProps) {
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
    <div className="p-4 space-y-4">
      {/* 썸네일 */}
      <div className="relative">
        <img
          src={video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium.url}
          alt={video.snippet.title}
          className="w-full aspect-video object-cover rounded-lg"
        />
        {video.contentDetails?.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 text-xs text-white rounded-md flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(video.contentDetails.duration)}
          </div>
        )}
      </div>

      {/* 제목 */}
      <h1 className="text-xl font-semibold">{video.snippet.title}</h1>

      {/* 채널 정보 */}
      <div className="flex items-center gap-2">
        <img
          src={video.snippet.thumbnails.default.url}
          alt={video.snippet.channelTitle}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h2 className="font-medium">{video.snippet.channelTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {formatDate(video.snippet.publishedAt)}
          </p>
        </div>
      </div>

      {/* 통계 */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {formatNumber(Number(video.statistics?.viewCount || 0))}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-4 w-4" />
          {formatNumber(Number(video.statistics?.likeCount || 0))}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4" />
          {formatNumber(Number(video.statistics?.commentCount || 0))}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {formatDate(video.snippet.publishedAt)}
        </span>
      </div>

      {/* 설명 */}
      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
        {video.snippet.description}
      </div>

      {/* 태그 */}
      {video.snippet.tags && video.snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {video.snippet.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
} 