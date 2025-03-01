"use client"

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { YouTubeVideo } from "../types/youtube"

interface ThumbnailEffectAnalysisProps {
  videos: YouTubeVideo[]
}

export default function ThumbnailEffectAnalysis({ videos }: ThumbnailEffectAnalysisProps) {
  const data = videos.map((video) => ({
    title: video.snippet.title,
    views: Number(video.statistics?.viewCount || 0),
    brightness: calculateBrightness(video.snippet.thumbnails.medium.url),
  }))

  return (
    <div className="h-[400px] w-full">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="brightness" name="밝기" unit="%" />
            <YAxis type="number" dataKey="views" name="조회수" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="썸네일 효과" data={data} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          썸네일 효과 분석 데이터가 없습니다.
        </div>
      )}
    </div>
  )
}

function calculateBrightness(imageUrl: string): number {
  // 이 함수는 실제로 이미지의 밝기를 계산해야 합니다.
  // 여기서는 간단히 랜덤 값을 반환합니다.
  return Math.random() * 100
}

