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

interface VideoAnalyticsProps {
  video: YouTubeVideo
}

export function VideoAnalytics({ video }: VideoAnalyticsProps) {
  const [analysis, setAnalysis] = useState<{
    score: number
    metrics: {
      viewScore: number
      engagementScore: number
      retentionScore: number
      ctrScore: number
      qualityScore: number
    }
    insights: string[]
    recommendations: string[]
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true)
        const result = await analyzeVideoScore(video, {
          viewCount: "0",
          subscriberCount: "0",
          videoCount: "0"
        })
        setAnalysis(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [video])

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="p-4 space-y-6">
      {/* 종합 점수 */}
      <Card className="p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">종합 점수</h3>
          <div className="text-3xl font-bold text-primary">
            {Math.round(analysis.score)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">1000점 만점</p>
        </div>
      </Card>

      {/* 세부 지표 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <h4 className="font-medium">조회수 점수</h4>
          </div>
          <div className="text-2xl font-semibold">
            {Math.round(analysis.metrics.viewScore)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <h4 className="font-medium">참여도 점수</h4>
          </div>
          <div className="text-2xl font-semibold">
            {Math.round(analysis.metrics.engagementScore)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="h-4 w-4 text-green-500" />
            <h4 className="font-medium">시청 지속률</h4>
          </div>
          <div className="text-2xl font-semibold">
            {Math.round(analysis.metrics.retentionScore)}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="h-4 w-4 text-purple-500" />
            <h4 className="font-medium">클릭률 점수</h4>
          </div>
          <div className="text-2xl font-semibold">
            {Math.round(analysis.metrics.ctrScore)}
          </div>
        </Card>
      </div>

      {/* 인사이트 */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">주요 인사이트</h3>
        <ul className="space-y-2">
          {analysis.insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-2">
              <Target className="h-4 w-4 mt-1 text-primary" />
              <span className="text-sm">{insight}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 추천사항 */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">개선 추천사항</h3>
        <ul className="space-y-2">
          {analysis.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start gap-2">
              <Star className="h-4 w-4 mt-1 text-yellow-500" />
              <span className="text-sm">{recommendation}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
} 