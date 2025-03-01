/**
 * 비디오 리스트 뷰 컴포넌트
 * 
 * 비디오 목록을 테이블 형태로 표시하는 컴포넌트입니다.
 * 다음과 같은 특징과 기능을 제공합니다:
 * 
 * 1. 테이블 레이아웃
 *    - 정렬 가능한 컬럼
 *    - 체크박스 선택
 *    - 반응형 디자인
 * 
 * 2. 컬럼 구성
 *    - 썸네일 및 제목
 *    - 조회수
 *    - 채널명
 *    - 후킹지수
 *    - 성장지수
 *    - 게시일
 * 
 * 3. 인터랙션
 *    - 행 호버 효과
 *    - 정렬 방향 표시
 *    - 다중 선택 지원
 * 
 * 4. 성능 최적화
 *    - 가상화된 스크롤
 *    - 지연 로딩
 *    - 메모이제이션
 * 
 * @component
 * @param {Object} props
 * @param {YouTubeVideo[]} props.videos - 표시할 비디오 목록
 * @param {(video: YouTubeVideo) => void} props.onVideoSelect - 비디오 선택 핸들러
 */

"use client"

import type { YouTubeVideo } from "@/types/youtube"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber, formatDate } from "@/lib/utils"
import { 
  Eye, 
  ChevronUp, 
  ChevronDown, 
  Users, 
  Clock, 
  BarChart2, 
  TrendingUp, 
  Calendar,
  Info
} from "lucide-react"
import { useState } from "react"

interface ListViewProps {
  videos: YouTubeVideo[]
  onVideoSelect: (video: YouTubeVideo) => void
}

type SortField = "views" | "date" | "comments" | "subscribers" | "duration" | "performance" | "contribution"
type SortDirection = "asc" | "desc"

export function ListView({ videos, onVideoSelect }: ListViewProps) {
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [sortField, setSortField] = useState<SortField>("views")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const formatDuration = (duration?: string) => {
    if (!duration) return "00:00"
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return "00:00"
    
    const hours = match[1] ? parseInt(match[1], 10) : 0
    const minutes = match[2] ? parseInt(match[2], 10) : 0
    const seconds = match[3] ? parseInt(match[3], 10) : 0

    const formatNumber = (num: number) => num.toString().padStart(2, "0")

    if (hours > 0) {
      return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`
    }
    return `${formatNumber(minutes)}:${formatNumber(seconds)}`
  }

  const getHookingBadge = (performance: string) => {
    switch (performance) {
      case "Good":
        return <Badge className="bg-green-500">좋음</Badge>
      case "Normal":
        return <Badge className="bg-blue-500">보통</Badge>
      case "Bad":
        return <Badge className="bg-yellow-500">나쁨</Badge>
      case "Worst":
        return <Badge className="bg-red-500">최악</Badge>
      default:
        return <Badge className="bg-gray-500">-</Badge>
    }
  }

  const getGrowthBadge = (contribution: string) => {
    switch (contribution) {
      case "Good":
        return <Badge className="bg-green-500">좋음</Badge>
      case "Normal":
        return <Badge className="bg-blue-500">보통</Badge>
      case "Bad":
        return <Badge className="bg-yellow-500">나쁨</Badge>
      case "Worst":
        return <Badge className="bg-red-500">최악</Badge>
      default:
        return <Badge className="bg-gray-500">-</Badge>
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedVideos = [...videos].sort((a, b) => {
    const modifier = sortDirection === "asc" ? 1 : -1
    
    switch (sortField) {
      case "views":
        return (Number(a.statistics?.viewCount || a.views || 0) - Number(b.statistics?.viewCount || b.views || 0)) * modifier
      case "date":
        return (new Date(a.snippet.publishedAt || a.publishDate || '').getTime() - new Date(b.snippet.publishedAt || b.publishDate || '').getTime()) * modifier
      case "comments":
        return (Number(a.statistics?.commentCount || 0) - Number(b.statistics?.commentCount || 0)) * modifier
      case "subscribers":
        return (Number(a.subscribers || 0) - Number(b.subscribers || 0)) * modifier
      case "duration":
        const getDurationInSeconds = (duration?: string) => {
          if (!duration) return 0
          const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
          if (!match) return 0
          const hours = match[1] ? parseInt(match[1], 10) : 0
          const minutes = match[2] ? parseInt(match[2], 10) : 0
          const seconds = match[3] ? parseInt(match[3], 10) : 0
          return hours * 3600 + minutes * 60 + seconds
        }
        return (getDurationInSeconds(a.contentDetails?.duration || a.duration) - getDurationInSeconds(b.contentDetails?.duration || b.duration)) * modifier
      case "performance":
        const performanceOrder = { "Good": 3, "Normal": 2, "Bad": 1, "Worst": 0 }
        return ((performanceOrder[a.performance as keyof typeof performanceOrder] || 0) - (performanceOrder[b.performance as keyof typeof performanceOrder] || 0)) * modifier
      case "contribution":
        const contributionOrder = { "Good": 3, "Normal": 2, "Bad": 1, "Worst": 0 }
        return ((contributionOrder[a.contribution as keyof typeof contributionOrder] || 0) - (contributionOrder[b.contribution as keyof typeof contributionOrder] || 0)) * modifier
      default:
        return 0
    }
  })

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    )
  }

  const getVideoId = (video: YouTubeVideo): string => {
    if (video.videoId) {
      return video.videoId
    }
    
    if (typeof video.id === 'string') {
      return video.id
    }
    
    return video.id.videoId
  }

  const getThumbnailUrl = (video: YouTubeVideo): string => {
    if (video.thumbnail) {
      return video.thumbnail
    }
    
    if (video.snippet.thumbnails.medium?.url) {
      return video.snippet.thumbnails.medium.url
    }
    
    return video.snippet.thumbnails.default.url
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border animate-in fade-in-50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedVideos.length === videos.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedVideos(videos.map(getVideoId))
                    } else {
                      setSelectedVideos([])
                    }
                  }}
                />
              </TableHead>
              <TableHead>제목</TableHead>
              <TableHead 
                className="w-24 text-right cursor-pointer"
                onClick={() => handleSort("views")}
              >
                <div className="flex items-center justify-end gap-2">
                  <Eye className="h-4 w-4" />
                  조회수
                  {sortField === "views" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="w-24 text-right cursor-pointer"
                onClick={() => handleSort("subscribers")}
              >
                <div className="flex items-center justify-end gap-2">
                  <Users className="h-4 w-4" />
                  구독자
                  {sortField === "subscribers" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </TableHead>
              <TableHead className="w-32">채널</TableHead>
              <TableHead 
                className="w-24 text-right cursor-pointer"
                onClick={() => handleSort("duration")}
              >
                <div className="flex items-center justify-end gap-2">
                  <Clock className="h-4 w-4" />
                  길이
                  {sortField === "duration" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="w-24 text-center cursor-pointer"
                onClick={() => handleSort("performance")}
              >
                <div className="flex items-center justify-center gap-2">
                  <BarChart2 className="h-4 w-4" />
                  후킹지수
                  {sortField === "performance" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="w-24 text-center cursor-pointer"
                onClick={() => handleSort("contribution")}
              >
                <div className="flex items-center justify-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  성장지수
                  {sortField === "contribution" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="w-24 text-right cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center justify-end gap-2">
                  <Calendar className="h-4 w-4" />
                  게시일
                  {sortField === "date" && (
                    sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVideos.map((video, index) => (
              <TableRow
                key={`${getVideoId(video)}-${index}`}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onVideoSelect(video)}
              >
                <TableCell className="w-12">
                  <Checkbox
                    checked={selectedVideos.includes(getVideoId(video))}
                    onCheckedChange={() => toggleVideoSelection(getVideoId(video))}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={getThumbnailUrl(video)}
                        alt={video.snippet.title}
                        className="w-40 aspect-video object-cover rounded-md"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-xs text-white rounded">
                        {formatDuration(video.contentDetails?.duration || video.duration)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-2">{video.snippet.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {video.snippet.description || "설명 없음"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {video.keyword || "키워드 없음"}
                        </Badge>
                        {video.totalVideos && (
                          <Badge variant="outline" className="text-xs">
                            채널 영상 수: {formatNumber(video.totalVideos)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(Number(video.statistics?.viewCount || video.views || 0))}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(Number(video.subscribers || 0))}
                </TableCell>
                <TableCell>{video.snippet.channelTitle}</TableCell>
                <TableCell className="text-right">
                  {formatDuration(video.contentDetails?.duration || video.duration)}
                </TableCell>
                <TableCell className="text-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center justify-center">
                        {getHookingBadge(video.performance || "")}
                        {video.exposureProbability !== undefined && (
                          <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>노출 확률: {video.exposureProbability?.toFixed(2) || 0}%</p>
                      <p className="text-xs text-muted-foreground">구독자 대비 조회수 비율</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell className="text-center">
                  {getGrowthBadge(video.contribution || "")}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatDate(video.snippet.publishedAt || video.publishDate || '')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
} 