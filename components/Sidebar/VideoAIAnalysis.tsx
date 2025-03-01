"use client"

// 타입 임포트
import type { YouTubeVideo } from "@/types/youtube"
import { useState } from "react"
import { extractTranscript, analyzeVideo, getVideoId } from "@/lib/youtube"

// UI 컴포넌트 임포트
import { 
  Card, 
  CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert"

// 아이콘 임포트
import { 
  Loader2,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  Tag,
  Bookmark
} from "lucide-react"

interface VideoAIAnalysisProps {
  video: YouTubeVideo
}

interface AIAnalysisResult {
  analysis: string
  keywords?: string[]
  sentiment?: string
  topics?: string[]
  recommendations?: string[]
}

export function VideoAIAnalysis({ video }: VideoAIAnalysisProps) {
  const [transcript, setTranscript] = useState<string | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null)
  const [transcriptError, setTranscriptError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAiAnalysis = async () => {
    setLoading(true)
    try {
      // 트랜스크립트 가져오기
      const transcriptResult = await extractTranscript(getVideoId(video.id))
      
      if (transcriptResult.error) {
        setTranscriptError(transcriptResult.error)
        setLoading(false)
        return
      }
      
      setTranscript(transcriptResult.transcript)
      
      // AI 분석 시작
      const result = await analyzeVideo(getVideoId(video.id))
      
      if (result.error) {
        setTranscriptError(result.error)
      } else {
        setAiAnalysis(result)
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
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>분석 중...</span>
      </div>
    )
  }

  if (transcriptError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>분석 중 오류가 발생했습니다</AlertTitle>
        <AlertDescription>{transcriptError}</AlertDescription>
      </Alert>
    )
  }

  if (transcript && aiAnalysis) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">AI 분석 결과</h3>
                <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">
                  {aiAnalysis.analysis}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {aiAnalysis.keywords && aiAnalysis.keywords.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">주요 키워드</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.keywords.map((keyword, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {aiAnalysis.topics && aiAnalysis.topics.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">주요 주제</h3>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {aiAnalysis.topics.map((topic, index) => (
                    <li key={index}>{topic}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">개선 제안</h3>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {aiAnalysis.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h3 className="font-medium">추출된 스크립트</h3>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{transcript}</p>
            </div>
          </CardContent>
        </Card>
      </div>
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