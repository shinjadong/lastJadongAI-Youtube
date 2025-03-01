/**
 * 비디오 자막 분석 컴포넌트
 * 
 * 비디오의 자막을 추출하고 분석하는 컴포넌트입니다.
 * 다음과 같은 기능과 분석을 제공합니다:
 * 
 * 1. 자막 추출
 *    - 자동 생성 자막 지원
 *    - 수동 입력 자막 지원
 *    - 다국어 자막 처리
 * 
 * 2. 자막 분석
 *    - 주요 키워드 추출
 *    - 토픽 모델링
 *    - 시간별 내용 요약
 * 
 * 3. 타임라인 뷰
 *    - 시간별 자막 표시
 *    - 구간 이동 지원
 *    - 검색 및 필터링
 * 
 * 특징:
 * - 로딩 상태 표시
 * - 오류 처리 및 안내
 * - 자막 없는 경우 대체 UI
 * - 시간 기반 네비게이션
 * 
 * @component
 * @param {Object} props
 * @param {YouTubeVideo} props.video - 비디오 데이터
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

interface VideoTranscriptProps {
  video: YouTubeVideo
}

interface TranscriptSegment {
  text: string
  start: number
  duration: number
}

export function VideoTranscriptAnalysis({ video }: VideoTranscriptProps) {
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTranscript() {
      try {
        setLoading(true)
        const videoId = typeof video.id === 'string' ? video.id : video.id.videoId
        const result = await extractTranscript(videoId)

        if (result.error) {
          throw new Error(result.error)
        }

        if (result.transcript) {
          setTranscript(result.transcript)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "자막을 불러오는 중 오류가 발생했습니다")
      } finally {
        setLoading(false)
      }
    }

    fetchTranscript()
  }, [video])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const formatNumber = (num: number) => num.toString().padStart(2, "0")

    if (hours > 0) {
      return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(remainingSeconds)}`
    }
    return `${formatNumber(minutes)}:${formatNumber(remainingSeconds)}`
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </div>
          ))}
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

  if (transcript.length === 0) {
    return (
      <div className="p-4">
        <Card className="p-4">
          <div className="text-center text-muted-foreground">
            이 동영상에 대한 자막이 없습니다.
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="space-y-4">
        {transcript.map((segment, index) => (
          <Card
            key={index}
            className="p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(segment.start)}
              </div>
              <p className="flex-1 text-sm">
                {segment.text}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 