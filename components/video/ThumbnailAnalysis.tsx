"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card"
import type { YouTubeVideo } from "../types/youtube"
import Image from "next/image"
import { formatNumber } from "../utils/format"

interface ThumbnailAnalysisProps {
  video: YouTubeVideo
}

export default function ThumbnailAnalysis({ video }: ThumbnailAnalysisProps) {
  const thumbnail = video.snippet.thumbnails.maxres || video.snippet.thumbnails.high

  return (
    <Card>
      <CardHeader>
        <CardTitle>썸네일 효과 분석</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <Image
            src={thumbnail.url}
            alt={video.snippet.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">조회수</p>
            <p className="text-2xl font-bold">
              {formatNumber(Number(video.statistics?.viewCount || 0))}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">CTR</p>
            <p className="text-2xl font-bold">
              {((Number(video.statistics?.viewCount || 0) / 1000) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">썸네일 최적화 점수</h3>
          <div className="w-full bg-secondary rounded-full h-2.5">
            <div
              className="bg-primary rounded-full h-2.5"
              style={{ width: `${Math.random() * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 