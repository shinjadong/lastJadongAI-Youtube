"use client"

// 타입 임포트
import type { YouTubeVideo } from "@/types/youtube"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface VideoPerformanceChartProps {
  video: YouTubeVideo
  videoDetails?: any
}

export function VideoPerformanceChart({ video, videoDetails }: VideoPerformanceChartProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <h3 className="font-medium mb-4">상세 분석</h3>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            알고리즘 분석 중입니다. 상세 분석을 신청하시면 더 자세한 성과 분석 결과를 제공해 드립니다.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
} 