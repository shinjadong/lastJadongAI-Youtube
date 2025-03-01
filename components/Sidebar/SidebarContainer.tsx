/**
 * YouTube 비디오 사이드바 컨테이너 컴포넌트
 * 
 * 비디오 상세 정보를 표시하는 슬라이드 아웃 패널입니다.
 * 다음과 같은 탭으로 구성됩니다:
 * 
 * 1. 정보 탭
 *    - 기본 비디오 정보 (VideoBasicInfo)
 *    - 비디오 통계 (VideoStatistics)
 *    - 비디오 플레이어 (VideoEmbedPlayer)
 * 
 * 2. 분석 탭
 *    - 성과 지표 (VideoPerformanceMetrics)
 *    - 성과 추이 차트 (VideoTrendChart)
 * 
 * 3. AI 분석 탭
 *    - AI 인사이트 (VideoAIInsights)
 *    - 댓글 분석 (VideoCommentAnalysis)
 *    - 자막 분석 (VideoTranscriptAnalysis)
 * 
 * 4. 채널 탭
 *    - 채널 상세 정보 (ChannelDetailsCard)
 *    - 채널 성과 지표
 *    - 채널 동영상 목록
 * 
 * @component
 * @param {Object} props
 * @param {YouTubeVideo | null} props.video - 표시할 비디오 데이터
 * @param {() => void} props.onClose - 사이드바 닫기 핸들러
 */

"use client"

import { useState, useEffect } from "react"
import type { YouTubeVideo, ChannelDetails } from "@/types/youtube"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import { getChannelDetails, calculatePerformance, calculateContribution } from "@/lib/youtube"

// 컴포넌트 임포트
import { VideoInfo } from "./VideoInfo"
import { VideoPlayer } from "./VideoPlayer"
import { VideoStats } from "./VideoStats"
import { VideoMetrics } from "./VideoMetrics"
import { VideoPerformanceChart } from "./VideoPerformanceChart"
import { VideoAIAnalysis } from "./VideoAIAnalysis"
import { VideoChannelInfo } from "./VideoChannelInfo"

interface SidebarProps {
  video: YouTubeVideo | null
  onClose: () => void
}

const tabs = [
  { value: "info", label: "정보" },
  { value: "analytics", label: "분석" },
  { value: "ai", label: "AI 분석" },
  { value: "channel", label: "채널" },
]

export function Sidebar({ video, onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [channelDetails, setChannelDetails] = useState<ChannelDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [performanceRate, setPerformanceRate] = useState(0)
  const [contributionRate, setContributionRate] = useState(0)

  useEffect(() => {
    if (video && channelDetails) {
      // 성과도 계산
      const performance = calculatePerformance(
        Number(video.statistics?.viewCount || 0),
        Number(channelDetails.statistics?.subscriberCount || 0)
      )
      setPerformanceRate(performance)

      // 기여도 계산
      const averageViews = Number(channelDetails.statistics?.viewCount || 0) / 
        Number(channelDetails.statistics?.videoCount || 1)
      const contribution = calculateContribution(video, averageViews)
      setContributionRate(contribution)
    }
  }, [video, channelDetails])

  const handleLoadChannelDetails = async () => {
    if (!video) return
    
    setLoading(true)
    try {
      const result = await getChannelDetails(video.snippet.channelId)
      if (result.items?.[0]) {
        setChannelDetails(result.items[0])
      }
    } catch (error) {
      console.error('Error fetching channel details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!video) return null

  return (
    <Sheet open={!!video} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <div className="p-4 sticky top-0 bg-background z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold">{video.snippet.title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* 정보 탭 */}
          <TabsContent value="info">
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="p-4 space-y-4">
                <VideoPlayer video={video} />
                <VideoInfo video={video} />
                <VideoStats video={video} channelDetails={channelDetails} />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 분석 탭 */}
          <TabsContent value="analytics">
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="p-4 space-y-4">
                <VideoMetrics 
                  video={video} 
                  performanceRate={performanceRate} 
                  contributionRate={contributionRate} 
                />
                <VideoPerformanceChart video={video} />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* AI 분석 탭 */}
          <TabsContent value="ai">
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="p-4 space-y-4">
                <VideoAIAnalysis video={video} />
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 채널 탭 */}
          <TabsContent value="channel">
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="p-4 space-y-4">
                <VideoChannelInfo 
                  video={video}
                  channelDetails={channelDetails}
                  loading={loading}
                  onLoadChannelDetails={handleLoadChannelDetails}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
} 