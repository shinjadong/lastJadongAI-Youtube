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

interface VideoAIInsightsProps {
  video: YouTubeVideo
}

export function VideoAIAnalysis({ video }: VideoAIInsightsProps) {
  const [transcript, setTranscript] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string>("")
  const [transcriptError, setTranscriptError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const getVideoId = (id: string | { kind: string; videoId: string }): string => {
    return typeof id === 'string' ? id : id.videoId
  }

  const handleAiAnalysis = async () => {
    setLoading(true)
    try {
      const transcriptResult = await extractTranscript(getVideoId(video.id))
      
      if (transcriptResult.error) {
        setTranscriptError(transcriptResult.error)
        return
      }
      
      setTranscript(transcriptResult.transcript)
      
      // AI 분석 시작
      const result = await analyzeVideo(getVideoId(video.id))
      
      if (!result.error) {
        setAiAnalysis(result.analysis)
      }
    } catch (error) {
      setTranscriptError('스크립트 추출 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (transcriptError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>스크립트를 가져올 수 없습니다</AlertTitle>
        <AlertDescription>{transcriptError}</AlertDescription>
      </Alert>
    )
  }

  if (transcript) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">AI 분석 결과</h3>
              <div className="prose prose-sm dark:prose-invert">
                {aiAnalysis || (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>분석 중...</span>
                  </div>
                )}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="font-medium mb-2">추출된 스크립트</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{transcript}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="text-center">
      <Button onClick={handleAiAnalysis} disabled={loading}>
        {loading ? "분석 중..." : "AI 분석 시작"}
      </Button>
      <p className="text-sm text-muted-foreground mt-2">
        * 자막이 있는 영상에서만 스크립트를 추출할 수 있습니다.
      </p>
    </div>
  )
} 