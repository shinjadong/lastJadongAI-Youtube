/**
 * 비디오 성과 지표 컴포넌트
 * 
 * 비디오의 성과를 다각도로 분석하여 표시하는 카드 컴포넌트입니다.
 * 다음과 같은 성과 지표를 포함합니다:
 * 
 * 1. 영향력 지수
 *    - S/A/B/C 등급으로 표시
 *    - 구독자 대비 시청자 참여도 분석
 *    - 프로그레스 바로 시각화
 * 
 * 2. 성장 기여도
 *    - High/Good/Medium/Low 등급으로 표시
 *    - 채널 평균 성과 대비 기여도
 *    - 프로그레스 바로 시각화
 * 
 * 각 지표에는 상세 설명이 포함된 호버 카드가 제공되며,
 * 색상 코드로 성과 수준을 직관적으로 표시합니다.
 * 
 * @component
 * @param {Object} props
 * @param {YouTubeVideo} props.video - 비디오 데이터
 * @param {number} props.performanceRate - 성과율 (0-100)
 * @param {number} props.contributionRate - 기여도 (0-100)
 */

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

interface VideoPerformanceMetricsProps {
  video: YouTubeVideo
  performanceRate: number
  contributionRate: number
}

export function VideoPerformanceMetrics({ video, performanceRate, contributionRate }: VideoPerformanceMetricsProps) {
  const getBadgeVariant = (color: string) => {
    switch (color) {
      case 'primary':
        return 'default'
      case 'secondary':
      case 'destructive':
        return color
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-6">
        {/* 영향력 지수 섹션 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">영향력 지수</p>
              <div className="flex items-center gap-2">
                <HoverCard>
                  <HoverCardTrigger>
                    <Badge 
                      variant={getBadgeVariant(getPerformanceGrade(performanceRate).color)}
                      className="text-lg px-3 py-1 cursor-help"
                    >
                      {getPerformanceGrade(performanceRate).grade}
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{getPerformanceGrade(performanceRate).description}</p>
                      <p className="text-xs text-muted-foreground">
                        구독자 대비 시청자 참여도를 분석한 영향력 지표입니다.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <p className="text-2xl font-bold">{performanceRate.toFixed(1)}%</p>
              </div>
            </div>
            <Progress 
              value={performanceRate} 
              className={`w-1/3 ${
                getPerformanceGrade(performanceRate).color === 'secondary' ? 'bg-blue-500' :
                getPerformanceGrade(performanceRate).color === 'destructive' ? 'bg-red-500' :
                'bg-green-500'
              }`}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            이 동영상은 {getPerformanceGrade(performanceRate).description}을 보여주고 있습니다.
          </p>
        </div>

        {/* 성장 기여도 섹션 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">성장 기여도</p>
              <div className="flex items-center gap-2">
                <HoverCard>
                  <HoverCardTrigger>
                    <Badge 
                      variant={getBadgeVariant(getContributionGrade(contributionRate).color)}
                      className="text-lg px-3 py-1 cursor-help"
                    >
                      {getContributionGrade(contributionRate).grade}
                    </Badge>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{getContributionGrade(contributionRate).description}</p>
                      <p className="text-xs text-muted-foreground">
                        채널의 평균 성과 대비 이 동영상의 성장 기여도를 나타냅니다.
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
                <p className="text-2xl font-bold">{contributionRate.toFixed(1)}%</p>
              </div>
            </div>
            <Progress 
              value={contributionRate} 
              className={`w-1/3 ${
                getContributionGrade(contributionRate).color === 'secondary' ? 'bg-blue-500' :
                getContributionGrade(contributionRate).color === 'destructive' ? 'bg-red-500' :
                'bg-green-500'
              }`}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            채널 성장에 {getContributionGrade(contributionRate).description}를 보입니다.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 