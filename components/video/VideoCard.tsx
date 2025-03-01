"use client"

import type { YouTubeVideo } from "@/types/youtube"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, ThumbsUp, Calendar, Clock, ExternalLink } from "lucide-react"
import { formatNumber, formatDate } from "@/lib/utils"

interface VideoCardProps {
  video: YouTubeVideo
  onClick: () => void
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  // 비디오 길이 포맷팅
  const formatDuration = (duration?: string) => {
    if (!duration) return "00:00"
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return "00:00"
    
    const hours = match[1] ? parseInt(match[1], 10) : 0
    const minutes = match[2] ? parseInt(match[2], 10) : 0
    const seconds = match[3] ? parseInt(match[3], 10) : 0
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // 기여도 색상 가져오기
  const getContributionColor = (contribution?: string) => {
    switch (contribution) {
      case "Good":
        return "text-green-600"
      case "Normal":
        return "text-blue-600"
      case "Bad":
        return "text-yellow-600"
      case "Worst":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // 성과도 색상 가져오기
  const getPerformanceColor = (performance?: string) => {
    switch (performance) {
      case "Good":
        return "text-green-600"
      case "Normal":
        return "text-blue-600"
      case "Bad":
        return "text-yellow-600"
      case "Worst":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  // 기여도 텍스트 가져오기
  const getContributionText = (contribution?: string) => {
    switch (contribution) {
      case "Good":
        return "좋음"
      case "Normal":
        return "보통"
      case "Bad":
        return "나쁨"
      case "Worst":
        return "최악"
      default:
        return "알 수 없음"
    }
  }

  // 성과도 텍스트 가져오기
  const getPerformanceText = (performance?: string) => {
    switch (performance) {
      case "Good":
        return "좋음"
      case "Normal":
        return "보통"
      case "Bad":
        return "나쁨"
      case "Worst":
        return "최악"
      default:
        return "알 수 없음"
    }
  }

  // 썸네일 URL 가져오기
  const getThumbnailUrl = () => {
    if (video.thumbnail) {
      return video.thumbnail
    }
    
    if (video.snippet.thumbnails.high?.url) {
      return video.snippet.thumbnails.high.url
    }
    
    return video.snippet.thumbnails.medium.url
  }

  // 비디오 ID 가져오기
  const getVideoId = () => {
    if (video.videoId) {
      return video.videoId
    }
    
    if (typeof video.id === 'string') {
      return video.id
    }
    
    return video.id.videoId
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img
          src={getThumbnailUrl()}
          alt={video.snippet.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {formatDuration(video.contentDetails?.duration)}
        </div>
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg line-clamp-2">{video.snippet.title}</CardTitle>
        <CardDescription>{video.snippet.channelTitle}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4 flex-grow">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{formatNumber(Number(video.statistics?.viewCount || video.views || 0))} 조회</span>
          </div>
          <div className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{formatNumber(Number(video.subscribers || 0))} 구독자</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{formatDate(video.snippet.publishedAt || video.publishDate || '')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{formatDuration(video.contentDetails?.duration)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">기여도: </span>
            <span className={getContributionColor(video.contribution)}>
              {getContributionText(video.contribution)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">성과도: </span>
            <span className={getPerformanceColor(video.performance)}>
              {getPerformanceText(video.performance)}
            </span>
          </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onClick}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          유튜브에서 보기
        </Button>
      </div>
    </Card>
  )
} 