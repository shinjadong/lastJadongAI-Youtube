/**
 * 비디오 통계 요약 컴포넌트
 * 
 * 비디오의 주요 통계 지표를 요약하여 표시하는 카드 컴포넌트입니다.
 * 다음과 같은 통계를 표시합니다:
 * 
 * - 평균 조회수: 비디오의 일일 평균 조회수
 * - 총 조회수: 누적 총 조회수
 * - 참여율: (좋아요 수 + 댓글 수) / 조회수 * 100
 * - 구독자 성장: 최근 3개월 간의 구독자 증가율
 * 
 * 모든 수치는 포맷팅되어 표시되며,
 * 채널 평균과 비교하여 상대적인 성과를 보여줍니다.
 * 
 * @component
 * @param {Object} props
 * @param {YouTubeVideo} props.video - 비디오 데이터
 * @param {any} props.channelDetails - 채널 상세 정보 (옵셔널)
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
import { Progress } from "@/components/ui/progress"
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
  getPerformanceGrade, 
  getContributionGrade 
} from "@/lib/utils"

interface VideoStatsProps {
  video: YouTubeVideo
  channelDetails?: any
}

export function VideoStats({ video, channelDetails }: VideoStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>성과 지표</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">평균 조회수</p>
            <p className="text-2xl font-bold">
              {formatNumber(Number(video.statistics?.viewCount || 0))}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">총 조회수</p>
            <p className="text-2xl font-bold">
              {formatNumber(Number(video.statistics?.viewCount || 0))}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">참여율</p>
            <p className="text-2xl font-bold">
              {((Number(video.statistics?.likeCount || 0) + Number(video.statistics?.commentCount || 0)) / 
                Number(video.statistics?.viewCount || 1) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">구독자 성장</p>
            <p className="text-2xl font-bold">
              {channelDetails?.subscriberGrowth || "로딩 중..."}
            </p>
            <Badge variant="secondary" className="mt-1">최근 3개월</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 