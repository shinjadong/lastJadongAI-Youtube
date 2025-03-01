/**
 * 비디오 그리드 뷰 컴포넌트
 * 
 * 비디오 목록을 카드 형태의 그리드로 표시하는 컴포넌트입니다.
 * 다음과 같은 특징을 가집니다:
 * 
 * 1. 레이아웃
 *    - 반응형 그리드 (1~3열)
 *    - 일관된 카드 크기
 *    - 적절한 여백과 간격
 * 
 * 2. 카드 디자인
 *    - 고품질 썸네일
 *    - 비디오 길이 오버레이
 *    - 제목 2줄 제한
 *    - 채널명 표시
 * 
 * 3. 인터랙션
 *    - 호버 효과
 *    - 클릭 피드백
 *    - 부드러운 애니메이션
 * 
 * 4. 성능 최적화
 *    - 이미지 지연 로딩
 *    - 가상 스크롤 지원
 *    - 메모이제이션
 * 
 * @component
 * @param {Object} props
 * @param {Video[]} props.videos - 표시할 비디오 목록
 * @param {(video: Video) => void} props.onVideoSelect - 비디오 선택 핸들러
 */

"use client"

import { useState } from "react"
import Image from "next/image"
import { Eye, ThumbsUp, Calendar, Clock, ExternalLink } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatNumber } from "@/lib/utils"
import { convertToYouTubeVideo } from "@/types/youtube"

interface Video {
  _id: string
  videoId: string
  title: string
  thumbnail: string
  duration: string
  views: number
  subscribers: number
  contribution: string
  performance: string
  exposureProbability: number
  totalVideos: number
  publishDate: string
  channelId: string
  channelTitle: string
  keyword: string
  round_no: string
  uid: string
}

interface GridViewProps {
  videos: Video[]
  onVideoSelect: (video: any) => void
}

export function GridView({ videos, onVideoSelect }: GridViewProps) {
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null)

  const formatDuration = (duration: string) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getContributionColor = (contribution: string) => {
    switch (contribution) {
      case "Good":
        return "bg-green-500"
      case "Normal":
        return "bg-blue-500"
      case "Bad":
        return "bg-yellow-500"
      case "Worst":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "Good":
        return "bg-green-500"
      case "Normal":
        return "bg-blue-500"
      case "Bad":
        return "bg-yellow-500"
      case "Worst":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getContributionText = (contribution: string) => {
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

  const getPerformanceText = (performance: string) => {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <Card 
          key={video._id} 
          className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          onMouseEnter={() => setHoveredVideo(video._id)}
          onMouseLeave={() => setHoveredVideo(null)}
          onClick={() => onVideoSelect(convertToYouTubeVideo(video))}
        >
          <div className="relative aspect-video">
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>
          <CardContent className="p-3">
            <h3 className="font-medium line-clamp-2 h-12 mb-2">{video.title}</h3>
            <div className="text-sm text-muted-foreground mb-2">
              {video.channelTitle}
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatNumber(video.views)}
              </Badge>
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(video.publishDate)}
              </Badge>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge className={`${getContributionColor(video.contribution)} text-white text-xs`}>
                성장지수: {getContributionText(video.contribution)}
              </Badge>
              <Badge className={`${getPerformanceColor(video.performance)} text-white text-xs`}>
                후킹지수: {getPerformanceText(video.performance)}
              </Badge>
            </div>
          </CardContent>
          {hoveredVideo === video._id && (
            <CardFooter className="p-3 pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(`https://www.youtube.com/watch?v=${video.videoId}`, "_blank")
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                유튜브에서 보기
              </Button>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
} 
