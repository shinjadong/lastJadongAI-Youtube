"use client"

import { useState, useEffect } from "react"
import type { YouTubeVideo, ChannelDetails } from "@/types/youtube"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import { getVideoDetails } from "@/lib/youtube"
import axios from "axios"

// 컴포넌트 임포트
import { VideoInfo } from "./VideoInfo"
import { VideoPlayer } from "./VideoPlayer"
import { VideoStats } from "./VideoStats"
import { VideoMetrics } from "./VideoMetrics"
import { VideoPerformanceChart } from "./VideoPerformanceChart"
import { VideoAIAnalysis } from "./VideoAIAnalysis"
import { VideoCommentAnalysis } from "./VideoCommentAnalysis"
import { VideoChannelInfo } from "./VideoChannelInfo"

interface SidebarProps {
  video: YouTubeVideo | null
  onClose: () => void
}

const tabs = [
  { value: "info", label: "정보" },
  { value: "analytics", label: "분석" },
  { value: "ai", label: "AI 분석" },
  { value: "comments", label: "댓글" },
  { value: "channel", label: "채널" },
]

export function Sidebar({ video, onClose }: SidebarProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [channelDetails, setChannelDetails] = useState<ChannelDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [performanceRate, setPerformanceRate] = useState(0)
  const [contributionRate, setContributionRate] = useState(0)
  const [videoDetails, setVideoDetails] = useState<any>(null)

  useEffect(() => {
    if (video) {
      fetchVideoDetails()
    }
  }, [video])

  const fetchVideoDetails = async () => {
    if (!video) return
    
    setLoading(true)
    try {
      // 비디오 상세 정보 API 호출
      const videoId = typeof video.id === 'string' ? video.id : video.id.videoId
      const response = await axios.get(`/api/contents/videos/details`, {
        params: { videoId }
      })
      
      if (response.data.status === "success") {
        const data = response.data.data
        setVideoDetails(data)
        
        // 채널 정보 설정
        if (data.channel) {
          setChannelDetails(data.channel)
        }
        
        // 성과 지표 설정
        if (data.video) {
          setPerformanceRate(data.video.exposureProbability || 0)
          // 기여도는 API 응답에서 직접 계산할 수 없으므로 기본값 사용
          setContributionRate(50) // 기본값
        }
      }
    } catch (error) {
      console.error('Error fetching video details:', error)
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
          <TabsList className="grid w-full grid-cols-5">
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
                <VideoInfo 
                  video={video} 
                  videoDetails={videoDetails?.video} 
                />
                <VideoStats 
                  video={video} 
                  channelDetails={channelDetails} 
                  videoDetails={videoDetails?.video}
                />
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
                  videoDetails={videoDetails?.video}
                />
                <VideoPerformanceChart 
                  video={video} 
                  videoDetails={videoDetails?.video}
                />
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

          {/* 댓글 탭 */}
          <TabsContent value="comments">
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="p-4 space-y-4">
                <VideoCommentAnalysis 
                  video={video} 
                  commentData={videoDetails?.comments}
                />
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
                  onLoadChannelDetails={fetchVideoDetails}
                />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
} 