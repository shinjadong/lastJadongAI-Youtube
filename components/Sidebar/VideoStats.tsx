"use client"

// 타입 임포트
import type { YouTubeVideo, ChannelDetails } from "@/types/youtube"

// UI 컴포넌트 임포트
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Eye, 
  Video
} from "lucide-react"

// 유틸리티 임포트
import { formatNumber } from "@/lib/utils"

interface VideoStatsProps {
  video: YouTubeVideo
  channelDetails: ChannelDetails | null
  videoDetails?: any
}

export function VideoStats({ video, channelDetails, videoDetails }: VideoStatsProps) {
  // 후킹지수 (성과도) 계산
  const getHookingRate = () => {
    if (videoDetails?.performance) {
      return videoDetails.exposureProbability || 0;
    }
    
    // 기존 방식으로 계산
    const views = Number(video.statistics?.viewCount || video.views || 0);
    const subscribers = channelDetails 
      ? Number(channelDetails.statistics.subscriberCount) 
      : Number(video.subscribers || 0);
    
    if (subscribers === 0) return 0;
    return Math.min((views / subscribers) * 100, 100);
  };
  
  // 성장지수 (기여도) 계산
  const getGrowthRate = () => {
    if (videoDetails?.contribution) {
      return 50; // API에서 직접적인 값을 제공하지 않으므로 기본값 사용
    }
    
    // 기존 방식으로 계산
    const views = Number(video.statistics?.viewCount || video.views || 0);
    const averageViews = channelDetails 
      ? Number(channelDetails.statistics.viewCount) / Number(channelDetails.statistics.videoCount || 1)
      : 0;
    
    if (averageViews === 0) return 0;
    return Math.min((views / averageViews) * 100, 100);
  };
  
  // 성과 등급 계산
  const getPerformanceGrade = (rate: number) => {
    if (rate > 50) return { label: "좋음", color: "text-green-500" };
    if (rate > 10) return { label: "보통", color: "text-blue-500" };
    if (rate > 5) return { label: "나쁨", color: "text-yellow-500" };
    return { label: "최악", color: "text-red-500" };
  };
  
  // 기여도 등급 계산
  const getContributionGrade = (rate: number) => {
    if (rate > 150) return { label: "좋음", color: "text-green-500" };
    if (rate > 50) return { label: "보통", color: "text-blue-500" };
    if (rate > 25) return { label: "나쁨", color: "text-yellow-500" };
    return { label: "최악", color: "text-red-500" };
  };
  
  const hookingRate = getHookingRate();
  const growthRate = getGrowthRate();
  const performanceGrade = getPerformanceGrade(hookingRate);
  const contributionGrade = getContributionGrade(growthRate);
  
  // 구독자 수 가져오기
  const getSubscribers = () => {
    if (channelDetails) {
      return Number(channelDetails.statistics.subscriberCount);
    }
    if (videoDetails?.channel?.statistics?.subscriberCount) {
      return Number(videoDetails.channel.statistics.subscriberCount);
    }
    return Number(video.subscribers || 0);
  };
  
  // 총 비디오 수 가져오기
  const getTotalVideos = () => {
    if (channelDetails) {
      return Number(channelDetails.statistics.videoCount);
    }
    if (videoDetails?.channel?.statistics?.videoCount) {
      return Number(videoDetails.channel.statistics.videoCount);
    }
    return Number(video.totalVideos || 0);
  };
  
  const subscribers = getSubscribers();
  const totalVideos = getTotalVideos();

  return (
    <Card>
      <CardHeader>
        <CardTitle>성과 지표</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">후킹지수</span>
              </div>
              <span className={`text-sm font-medium ${performanceGrade.color}`}>
                {performanceGrade.label} ({hookingRate.toFixed(1)}%)
              </span>
            </div>
            <Progress value={hookingRate} className="h-2">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${hookingRate}%` }} 
              />
            </Progress>
            <p className="text-xs text-muted-foreground mt-1">
              구독자 대비 조회수 비율을 나타냅니다.
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">성장지수</span>
              </div>
              <span className={`text-sm font-medium ${contributionGrade.color}`}>
                {contributionGrade.label} ({growthRate.toFixed(1)}%)
              </span>
            </div>
            <Progress value={growthRate} className="h-2">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${growthRate}%` }} 
              />
            </Progress>
            <p className="text-xs text-muted-foreground mt-1">
              채널 평균 조회수 대비 비율을 나타냅니다.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex flex-col items-center p-3 rounded-lg border">
              <Users className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground">구독자 수</span>
              <span className="text-lg font-semibold">{formatNumber(subscribers)}</span>
            </div>
            
            <div className="flex flex-col items-center p-3 rounded-lg border">
              <Video className="h-5 w-5 text-primary mb-1" />
              <span className="text-xs text-muted-foreground">총 영상 수</span>
              <span className="text-lg font-semibold">{formatNumber(totalVideos)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 