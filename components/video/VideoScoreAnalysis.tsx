"use client"

import { useState, useEffect } from "react"
import { analyzeVideoScore } from "@/app/actions/youtube"
import type { YouTubeVideo } from "@/app/types/youtube"
import { Card, CardHeader, CardTitle, CardContent } from "../../../../../components/ui/card"
import { Progress } from "../../../../../components/ui/progress"
import { Badge } from "../../../../../components/ui/badge"
import { Skeleton } from "../../../../../components/ui/skeleton"
import { ScrollArea } from "../../../../../components/ui/scroll-area"
import { useToast } from "../../../../../components/ui/use-toast"

interface VideoScoreAnalysisProps {
  video: YouTubeVideo
  channelStats: any
}

interface VideoScore {
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
}

export default function VideoScoreAnalysis({
  video,
  channelStats,
}: VideoScoreAnalysisProps) {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<VideoScore | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        const result = await analyzeVideoScore(video, channelStats)
        setAnalysis(result)
      } catch (error) {
        console.error("영상 스코어 분석 중 오류 발생:", error)
        toast({
          title: "분석 실패",
          description: "영상 스코어 분석 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [video, channelStats, toast])

  if (loading) {
    return <VideoScoreAnalysisSkeleton />
  }

  if (!analysis) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>영상 성과 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 종합 점수 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">종합 점수</span>
                <span className="text-2xl font-bold">
                  {Math.round(analysis.score)}
                </span>
              </div>
              <Progress value={analysis.score} max={1000} className="h-2" />
            </div>

            {/* 세부 지표 */}
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard
                title="조회수 성과"
                score={analysis.metrics.viewScore}
                description="채널 평균 대비 조회수 성과"
              />
              <MetricCard
                title="참여도"
                score={analysis.metrics.engagementScore}
                description="좋아요, 댓글 등 시청자 참여율"
              />
              <MetricCard
                title="시청 지속률"
                score={analysis.metrics.retentionScore}
                description="예상 시청 지속 시간"
              />
              <MetricCard
                title="클릭률 (CTR)"
                score={analysis.metrics.ctrScore}
                description="제목과 썸네일의 매력도"
              />
              <MetricCard
                title="콘텐츠 품질"
                score={analysis.metrics.qualityScore}
                description="영상 최적화 수준"
              />
            </div>

            {/* 인사이트 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">주요 인사이트</h3>
              <div className="space-y-2">
                {analysis.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Badge variant="secondary">인사이트</Badge>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 추천사항 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">개선 추천사항</h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Badge variant="outline">추천</Badge>
                      <span>{recommendation}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  title,
  score,
  description,
}: {
  title: string
  score: number
  description: string
}) {
  const getScoreColor = (score: number) => {
    if (score >= 800) return "bg-green-500"
    if (score >= 600) return "bg-blue-500"
    if (score >= 400) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="text-xl font-bold">{Math.round(score)}</div>
      </div>
      <Progress
        value={score}
        max={1000}
        className={`mt-2 h-1 ${getScoreColor(score)}`}
      />
    </div>
  )
}

function VideoScoreAnalysisSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-8 w-full" />
            <div className="grid gap-4 md:grid-cols-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-[150px]" />
              <div className="space-y-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 