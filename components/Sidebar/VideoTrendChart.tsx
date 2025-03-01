/**
 * 비디오 성과 추이 차트 컴포넌트
 * 
 * 비디오의 시간별 성과 추이를 시각화하는 차트 컴포넌트입니다.
 * Recharts 라이브러리를 사용하여 다음 데이터를 표시합니다:
 * 
 * 1. 시간별 조회수 추이
 *    - 일자별 조회수 변화
 *    - 성장률 표시
 *    - 이동 평균선
 * 
 * 2. 참여도 추이
 *    - 조회수 대비 참여율 변화
 *    - 좋아요, 댓글 비율
 * 
 * 특징:
 * - 반응형 레이아웃
 * - 호버 시 상세 정보 툴팁
 * - 커스텀 데이터 포맷팅
 * - 그리드 라인 및 범례
 * 
 * @component
 * @param {Object} props
 * @param {YouTubeVideo} props.video - 비디오 데이터
 */

"use client"

// 타입 임포트
import type { YouTubeVideo } from "@/types/youtube"

// React 임포트
import { useState, useEffect } from "react"

// Recharts 임포트
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts"

// UI 컴포넌트 임포트
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from "@/components/ui/hover-card"
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

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

interface VideoTrendChartProps {
  video: YouTubeVideo
}

// 차트 데이터 타입 정의
interface ChartDataPoint {
  date: string;
  views: number;
}

export function VideoTrendChart({ video }: VideoTrendChartProps) {
  const [growthData, setGrowthData] = useState<ChartDataPoint[]>([])

  useEffect(() => {
    if (video?.statistics?.viewCount) {
      // 가상의 히스토리 데이터 생성 (실제로는 API에서 받아와야 함)
      const viewCount = Number(video.statistics.viewCount)
      const historicalData: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        const randomGrowth = 0.97 + Math.random() * 0.06 // -3% to +3% 변동
        const views = Math.round(viewCount * (0.7 + (i * 0.3 / 29)) * randomGrowth)
        return {
          date: date.toISOString().split('T')[0],
          views: views
        }
      })

      setGrowthData(historicalData)
    }
  }, [video])

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value: string) => value.split('-').slice(1).join('/')}
              />
              <YAxis 
                tickFormatter={(value: number) => formatNumber(value)}
              />
              <Tooltip 
                formatter={(value: number) => [formatNumber(value), "조회수"]}
                labelFormatter={(label: string) => `${label.split('-').slice(1).join('/')}`}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 