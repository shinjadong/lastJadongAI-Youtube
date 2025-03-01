"use client"

import type { YouTubeVideo, ChannelDetails } from "@/types/youtube"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface VideoChannelInfoProps {
  video: YouTubeVideo
  channelDetails: ChannelDetails | null
  loading: boolean
  onLoadChannelDetails: () => void
}

export function VideoChannelInfo({ 
  video, 
  channelDetails, 
  loading, 
  onLoadChannelDetails 
}: VideoChannelInfoProps) {
  if (!channelDetails && !loading) {
    return (
      <div className="text-center py-4">
        <Button onClick={onLoadChannelDetails}>
          채널 정보 불러오기
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>채널 정보 로딩 중...</span>
      </div>
    )
  }

  if (!channelDetails) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>채널 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {channelDetails.snippet.thumbnails.default && (
              <img
                src={channelDetails.snippet.thumbnails.default.url}
                alt={channelDetails.snippet.title}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{channelDetails.snippet.title}</h3>
              <p className="text-sm text-muted-foreground">
                {channelDetails.snippet.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">
                  구독자 {formatNumber(Number(channelDetails.statistics.subscriberCount))}명
                </Badge>
                <Badge variant="secondary">
                  총 동영상 {formatNumber(Number(channelDetails.statistics.videoCount))}개
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>채널 성과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">평균 조회수</p>
              <p className="text-2xl font-bold">
                {formatNumber(Math.round(
                  Number(channelDetails.statistics.viewCount) / 
                  Number(channelDetails.statistics.videoCount)
                ))}
              </p>
              <Badge variant="secondary" className="mt-1">동영상당</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">총 조회수</p>
              <p className="text-2xl font-bold">
                {formatNumber(Number(channelDetails.statistics.viewCount))}
              </p>
              <Badge variant="secondary" className="mt-1">누적</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">참여율</p>
              <p className="text-2xl font-bold">
                {((Number(channelDetails.statistics.viewCount) / 
                  Number(channelDetails.statistics.subscriberCount)) * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">구독자</p>
              <p className="text-2xl font-bold">
                {formatNumber(Number(channelDetails.statistics.subscriberCount))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 