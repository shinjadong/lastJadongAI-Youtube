"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { YouTubeVideo } from "../../../../types/youtube"
import { formatNumber } from "../../../../../utils/format"

interface VideoPerformanceChartProps {
  video: YouTubeVideo
}

export default function VideoPerformanceChart({ video }: VideoPerformanceChartProps) {
  // 영상 등록일부터 현재까지의 일자별 데이터 생성
  const generateTimeSeriesData = () => {
    const publishDate = new Date(video.snippet.publishedAt)
    const currentDate = new Date()
    const totalDays = Math.floor((currentDate.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24))
    const viewCount = Number(video.statistics?.viewCount || 0)
    
    // 일평균 조회수 계산 (단순 선형 증가 가정)
    const dailyViews = viewCount / totalDays
    
    const data = []
    for (let i = 0; i <= totalDays; i += Math.max(1, Math.floor(totalDays / 10))) { // 10개의 데이터 포인트로 제한
      const date = new Date(publishDate.getTime() + i * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        views: Math.floor(dailyViews * i)
      })
    }
    
    // 마지막 데이터 포인트 (현재)
    data.push({
      date: currentDate.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      views: viewCount
    })
    
    return data
  }

  const timeSeriesData = generateTimeSeriesData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>동영상 성과 지표</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip 
              formatter={(value) => formatNumber(Number(value))}
              labelFormatter={(label) => `날짜: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="views" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

