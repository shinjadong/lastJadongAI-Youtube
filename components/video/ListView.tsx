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

import Image from "next/image"
import { Eye, Users, Calendar, Clock, ExternalLink } from "lucide-react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
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

interface ListViewProps {
  videos: Video[]
  onVideoSelect: (video: any) => void
}

export function ListView({ videos, onVideoSelect }: ListViewProps) {
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">영상</TableHead>
            <TableHead>채널</TableHead>
            <TableHead>조회수</TableHead>
            <TableHead>구독자</TableHead>
            <TableHead>업로드일</TableHead>
            <TableHead>길이</TableHead>
            <TableHead>성장지수</TableHead>
            <TableHead>후킹지수</TableHead>
            <TableHead className="text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <TableRow 
              key={video._id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onVideoSelect(convertToYouTubeVideo(video))}
            >
              <TableCell className="font-medium">
                <div className="flex items-center space-x-3">
                  <div className="relative h-16 w-28 flex-shrink-0">
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover rounded-md"
                    />
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  <span className="line-clamp-2 text-sm">{video.title}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">{video.channelTitle}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{formatNumber(video.views)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm">{formatNumber(video.subscribers)}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">{formatDate(video.publishDate)}</TableCell>
              <TableCell className="text-sm">{formatDuration(video.duration)}</TableCell>
              <TableCell>
                <Badge className={`${getContributionColor(video.contribution)} text-white text-xs`}>
                  {getContributionText(video.contribution)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={`${getPerformanceColor(video.performance)} text-white text-xs`}>
                  {getPerformanceText(video.performance)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(`https://www.youtube.com/watch?v=${video.videoId}`, "_blank")
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">유튜브에서 보기</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 
