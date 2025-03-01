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

interface VideoCommentsProps {
  video: YouTubeVideo
}

export function VideoComments({ video }: VideoCommentsProps) {
  const [comments, setComments] = useState<CommentThread[]>([])
  const [sentiment, setSentiment] = useState<{
    positive: number
    negative: number
    neutral: number
    averageScore: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true)
        const videoId = typeof video.id === 'string' ? video.id : video.id.videoId
        const commentsResult = await getVideoComments(videoId)
        const sentimentResult = await analyzeCommentSentiment(videoId)

        if (commentsResult.error) {
          throw new Error(commentsResult.error)
        }

        setComments(commentsResult.items || [])
        if (sentimentResult.data?.summary) {
          setSentiment(sentimentResult.data.summary)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "댓글을 불러오는 중 오류가 발생했습니다")
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [video])

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded"></div>
          {[...Array(5)].map((_, i) => (
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

  return (
    <div className="p-4 space-y-6">
      {/* 감정 분석 요약 */}
      {sentiment && (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">댓글 감정 분석</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-lg font-semibold text-green-500">
                {sentiment.positive}
              </div>
              <div className="text-sm text-muted-foreground">긍정적</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Minus className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-lg font-semibold text-yellow-500">
                {sentiment.neutral}
              </div>
              <div className="text-sm text-muted-foreground">중립적</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-lg font-semibold text-red-500">
                {sentiment.negative}
              </div>
              <div className="text-sm text-muted-foreground">부정적</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-muted-foreground">평균 감정 점수</div>
            <div className="text-lg font-semibold">
              {sentiment.averageScore.toFixed(2)}
            </div>
          </div>
        </Card>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <Card
            key={comment.id}
            className="p-4"
          >
            <div className="flex items-start gap-3">
              <img
                src={comment.snippet.topLevelComment.snippet.authorProfileImageUrl || "/placeholder.svg"}
                alt={comment.snippet.topLevelComment.snippet.authorDisplayName}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {comment.snippet.topLevelComment.snippet.authorDisplayName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(comment.snippet.topLevelComment.snippet.publishedAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm">
                  {comment.snippet.topLevelComment.snippet.textDisplay}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {formatNumber(comment.snippet.topLevelComment.snippet.likeCount)}
                  </span>
                  {comment.snippet.totalReplyCount > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {formatNumber(comment.snippet.totalReplyCount)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 