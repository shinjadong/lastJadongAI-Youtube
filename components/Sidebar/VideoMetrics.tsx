"use client"

// 타입 임포트
import type { YouTubeVideo } from "@/types/youtube"

// UI 컴포넌트 임포트
import { 
  Card, 
  CardContent
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from "@/components/ui/hover-card"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Eye, 
  ThumbsUp, 
  MessageSquare
} from "lucide-react"
import { formatNumber } from "@/lib/utils"

// 유틸리티 함수
const getPerformanceGrade = (rate: number) => {
  if (rate > 50) return { label: "좋음", color: "text-green-500" };
  if (rate > 10) return { label: "보통", color: "text-blue-500" };
  if (rate > 5) return { label: "나쁨", color: "text-yellow-500" };
  return { label: "최악", color: "text-red-500" };
};

const getContributionGrade = (rate: number) => {
  if (rate > 150) return { label: "좋음", color: "text-green-500" };
  if (rate > 50) return { label: "보통", color: "text-blue-500" };
  if (rate > 25) return { label: "나쁨", color: "text-yellow-500" };
  return { label: "최악", color: "text-red-500" };
};

interface VideoMetricsProps {
  video: YouTubeVideo
  performanceRate: number
  contributionRate: number
  videoDetails?: any
}

export function VideoMetrics({ 
  video, 
  performanceRate, 
  contributionRate,
  videoDetails
}: VideoMetricsProps) {
  // 성과 등급 계산
  const performanceGrade = getPerformanceGrade(performanceRate);
  const contributionGrade = getContributionGrade(contributionRate);
  
  // 참여율 계산
  const getEngagementRate = () => {
    if (videoDetails?.statistics) {
      const views = Number(videoDetails.statistics.viewCount || 0);
      const comments = Number(videoDetails.statistics.commentCount || 0);
      
      if (views === 0) return 0;
      return (comments / views) * 100;
    }
    
    const views = Number(video.statistics?.viewCount || video.views || 0);
    const likes = Number(video.statistics?.likeCount || 0);
    const comments = Number(video.statistics?.commentCount || 0);
    
    if (views === 0) return 0;
    return ((likes + comments) / views) * 100;
  };
  
  const engagementRate = getEngagementRate();

  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="font-medium mb-4">성과 분석</h3>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">후킹지수</span>
              </div>
              <span className={`text-sm font-medium ${performanceGrade.color}`}>
                {performanceGrade.label} ({performanceRate.toFixed(1)}%)
              </span>
            </div>
            <Progress value={performanceRate} className="h-2">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${performanceRate}%` }} 
              />
            </Progress>
            <p className="text-xs text-muted-foreground mt-1">
              구독자 대비 조회수 비율을 나타냅니다. 높을수록 구독자 대비 많은 조회수를 기록한 영상입니다.
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">성장지수</span>
              </div>
              <span className={`text-sm font-medium ${contributionGrade.color}`}>
                {contributionGrade.label} ({contributionRate.toFixed(1)}%)
              </span>
            </div>
            <Progress value={contributionRate} className="h-2">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${contributionRate}%` }} 
              />
            </Progress>
            <p className="text-xs text-muted-foreground mt-1">
              채널 평균 조회수 대비 비율을 나타냅니다. 높을수록 채널 성장에 기여하는 영상입니다.
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">참여율</span>
              </div>
              <span className="text-sm font-medium">
                {engagementRate.toFixed(2)}%
              </span>
            </div>
            <Progress value={Math.min(engagementRate * 5, 100)} className="h-2">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${Math.min(engagementRate * 5, 100)}%` }} 
              />
            </Progress>
            <p className="text-xs text-muted-foreground mt-1">
              조회수 대비 댓글 비율을 나타냅니다. 높을수록 시청자 참여가 활발한 영상입니다.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col items-center p-3 rounded-lg border">
              <Eye className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground">조회수</span>
              <span className="text-lg font-semibold">
                {formatNumber(Number(videoDetails?.statistics?.viewCount || video.statistics?.viewCount || video.views || 0))}
              </span>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg border">
              <MessageSquare className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground">댓글 수</span>
              <span className="text-lg font-semibold">
                {formatNumber(Number(videoDetails?.statistics?.commentCount || video.statistics?.commentCount || 0))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 