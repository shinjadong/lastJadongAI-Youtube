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
} from "../../../../../components/ui/card"
import { Badge } from "../../../../../components/ui/badge"
import { Button } from "../../../../../components/ui/button"
import { Progress } from "../../../../../components/ui/progress"
import { Input } from "../../../../../components/ui/input"
import { Label } from "../../../../../components/ui/label"
import { Separator } from "../../../../../components/ui/separator"
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from "../../../../../components/ui/hover-card"
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "../../../../../components/ui/alert"
import { ScrollArea } from "../../../../../components/ui/scroll-area"

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

interface PerformanceProps {
  videos: YouTubeVideo[]
}

interface PerformanceData {
  date: string
  views: number
  likes: number
  comments: number
  performance: number
}

interface ScatterData {
  views: number
  engagement: number
  title: string
  z: number
}

export function Performance({ videos }: PerformanceProps) {
  // 시간순 성과 데이터 계산
  const timeSeriesData = useMemo(() => {
    const sortedVideos = [...videos].sort(
      (a, b) => new Date(a.snippet.publishedAt).getTime() - new Date(b.snippet.publishedAt).getTime()
    )

    return sortedVideos.map(video => ({
      date: new Date(video.snippet.publishedAt).toLocaleDateString(),
      views: Number(video.statistics?.viewCount || 0),
      likes: Number(video.statistics?.likeCount || 0),
      comments: Number(video.statistics?.commentCount || 0),
      performance: (Number(video.statistics?.likeCount || 0) + Number(video.statistics?.commentCount || 0)) / 
                  Number(video.statistics?.viewCount || 1) * 100
    }))
  }, [videos])

  // 조회수 vs 참여도 산점도 데이터
  const scatterData = useMemo(() => {
    return videos.map(video => {
      const views = Number(video.statistics?.viewCount || 0)
      const likes = Number(video.statistics?.likeCount || 0)
      const comments = Number(video.statistics?.commentCount || 0)
      const engagement = (likes + comments) / views * 100

      return {
        views,
        engagement,
        title: video.snippet.title,
        z: likes // 버블 크기를 좋아요 수로 설정
      }
    })
  }, [videos])

  // 성과 통계 계산
  const stats = useMemo(() => {
    const totalViews = videos.reduce((sum, video) => sum + Number(video.statistics?.viewCount || 0), 0)
    const totalLikes = videos.reduce((sum, video) => sum + Number(video.statistics?.likeCount || 0), 0)
    const totalComments = videos.reduce((sum, video) => sum + Number(video.statistics?.commentCount || 0), 0)
    const avgEngagement = videos.length > 0 ? (totalLikes + totalComments) / totalViews * 100 : 0

    return {
      totalViews,
      totalLikes,
      totalComments,
      avgEngagement
    }
  }, [videos])

  if (videos.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        성과 데이터가 없습니다.
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{formatNumber(stats.totalViews)}</div>
            <div className="text-sm text-muted-foreground">총 조회수</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatNumber(stats.totalLikes)}</div>
            <div className="text-sm text-muted-foreground">총 좋아요</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatNumber(stats.totalComments)}</div>
            <div className="text-sm text-muted-foreground">총 댓글</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.avgEngagement.toFixed(2)}%</div>
            <div className="text-sm text-muted-foreground">평균 참여율</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="h-[300px]">
            <h4 className="font-medium mb-4">시간별 성과 추이</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="views"
                  stroke="#2563eb"
                  name="조회수"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="performance"
                  stroke="#16a34a"
                  name="참여율 (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[300px]">
            <h4 className="font-medium mb-4">조회수 vs 참여도</h4>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="views"
                  name="조회수"
                  unit="회"
                />
                <YAxis
                  type="number"
                  dataKey="engagement"
                  name="참여율"
                  unit="%"
                />
                <ZAxis
                  type="number"
                  dataKey="z"
                  range={[50, 500]}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload?.[0]?.payload) return null
                    const data = payload[0].payload
                    return (
                      <div className="bg-background p-2 rounded-lg shadow border">
                        <div className="text-sm font-medium truncate max-w-[200px]">
                          {data.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          조회수: {formatNumber(data.views)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          참여율: {data.engagement.toFixed(2)}%
                        </div>
                      </div>
                    )
                  }}
                />
                <Scatter
                  name="비디오"
                  data={scatterData}
                  fill="#2563eb"
                  fillOpacity={0.6}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 