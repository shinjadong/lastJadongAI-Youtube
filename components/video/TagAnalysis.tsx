"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card"
import { Badge } from "../../../../../components/ui/badge"
import { Progress } from "../../../../../components/ui/progress"
import { Separator } from "../../../../../components/ui/separator"
import { HelpCircle, AlertCircle, CheckCircle2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../../components/ui/tooltip"
import type { YouTubeVideo } from "../types/youtube"

interface TagAnalysisProps {
  video: YouTubeVideo
}

export default function TagAnalysis({ video }: TagAnalysisProps) {
  const tags = video.snippet.tags || []
  
  // 태그 분석 로직
  const tagAnalysis = tags.map(tag => {
    // 태그 길이 점수 (5-20자 사이가 적절)
    const lengthScore = (() => {
      const length = tag.length
      if (length >= 5 && length <= 20) return 100
      if (length < 5) return length * 20
      return Math.max(0, 100 - (length - 20) * 5)
    })()

    // 태그 형식 점수 (특수문자, 공백 등 체크)
    const formatScore = (() => {
      const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(tag)
      const hasExcessiveSpaces = /\s{2,}/.test(tag)
      const startsWithHash = tag.startsWith('#')
      
      let score = 100
      if (hasSpecialChars) score -= 20
      if (hasExcessiveSpaces) score -= 20
      if (startsWithHash) score -= 10
      return Math.max(0, score)
    })()

    // 종합 점수
    const totalScore = Math.round((lengthScore + formatScore) / 2)

    return {
      tag,
      lengthScore,
      formatScore,
      totalScore
    }
  })

  // 전체 태그 점수 계산
  const overallScore = Math.round(
    tagAnalysis.reduce((acc, curr) => acc + curr.totalScore, 0) / (tagAnalysis.length || 1)
  )

  // 점수에 따른 상태 결정
  const getScoreStatus = (score: number) => {
    if (score >= 80) return { color: 'text-green-500', icon: CheckCircle2, text: '최적화됨' }
    if (score >= 60) return { color: 'text-yellow-500', icon: AlertCircle, text: '개선 필요' }
    return { color: 'text-red-500', icon: AlertCircle, text: '주의 필요' }
  }

  const scoreStatus = getScoreStatus(overallScore)

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>태그 분석</span>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>태그의 품질과 최적화 상태를 분석합니다</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm ${scoreStatus.color}`}>
                {scoreStatus.text}
              </span>
              <Badge 
                variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}
                className="ml-2"
              >
                {overallScore}점
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 태그 통계 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">총 태그 수</p>
                <p className="text-2xl font-bold">{tags.length}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">최적화된 태그</p>
                <p className="text-2xl font-bold">{tagAnalysis.filter(t => t.totalScore >= 80).length}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">개선 필요</p>
                <p className="text-2xl font-bold">{tagAnalysis.filter(t => t.totalScore < 80).length}</p>
              </div>
            </div>

            <Separator />

            {/* 태그 목록 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">사용된 태그</p>
                <Badge variant="outline" className="text-xs">
                  {tags.length}/50
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger>
                      <Badge 
                        variant="outline"
                        className={`text-xs cursor-help ${
                          tagAnalysis[index].totalScore >= 80 
                            ? 'border-green-500' 
                            : tagAnalysis[index].totalScore >= 60 
                              ? 'border-yellow-500' 
                              : 'border-red-500'
                        }`}
                      >
                        {tag}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs space-y-1">
                        <p>길이 적절성: {tagAnalysis[index].lengthScore}점</p>
                        <p>형식 적절성: {tagAnalysis[index].formatScore}점</p>
                        <p>종합 점수: {tagAnalysis[index].totalScore}점</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>

            <Separator />

            {/* 태그 분석 결과 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">태그 품질 분석</p>
                <Badge variant="outline" className="text-xs">
                  상세 정보
                </Badge>
              </div>
              {tagAnalysis.map((analysis, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <scoreStatus.icon className={`h-4 w-4 ${
                        analysis.totalScore >= 80 
                          ? 'text-green-500' 
                          : analysis.totalScore >= 60 
                            ? 'text-yellow-500' 
                            : 'text-red-500'
                      }`} />
                      <p className="text-sm font-medium">{analysis.tag}</p>
                    </div>
                    <Badge variant={analysis.totalScore >= 80 ? "default" : "secondary"}>
                      {analysis.totalScore}점
                    </Badge>
                  </div>
                  <Progress 
                    value={analysis.totalScore} 
                    className={`w-full ${
                      analysis.totalScore >= 80 ? 'bg-green-500' : 
                      analysis.totalScore >= 60 ? 'bg-blue-500' : 
                      'bg-red-500'
                    }`}
                  />
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>길이:</span>
                      <Progress value={analysis.lengthScore} className="h-1 w-14" />
                      <span>{analysis.lengthScore}점</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>형식:</span>
                      <Progress value={analysis.formatScore} className="h-1 w-14" />
                      <span>{analysis.formatScore}점</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 태그 최적화 제안 */}
            {overallScore < 80 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm font-medium">개선 제안</p>
                  </div>
                  <div className="bg-destructive/10 p-4 rounded-lg">
                    <ul className="text-sm space-y-2 list-disc pl-4 text-destructive">
                      {overallScore < 60 && (
                        <li>태그 수가 부족합니다. 10-15개의 관련 태그를 추가하세요.</li>
                      )}
                      {tagAnalysis.some(t => t.lengthScore < 80) && (
                        <li>태그 길이는 5-20자 사이가 적절합니다.</li>
                      )}
                      {tagAnalysis.some(t => t.formatScore < 80) && (
                        <li>특수 문자나 불필요한 공백을 제거하세요.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
} 