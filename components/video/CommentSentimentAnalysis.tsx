"use client"

import { useState, useEffect } from "react"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card"
import { analyzeCommentSentiment } from "../actions/youtube"
import { ApiResponseWithSummary, SentimentSummary } from "@/app/types/youtube"

interface CommentSentimentAnalysisProps {
  videoId: string
}

export default function CommentSentimentAnalysis({ videoId }: CommentSentimentAnalysisProps) {
  const [sentimentData, setSentimentData] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSentimentAnalysis = async () => {
      setLoading(true)
      const result = await analyzeCommentSentiment(videoId)
      if (result.error) {
        setError(result.error)
      } else {
        setSentimentData([
          { name: "긍정적", value: result?.data?.summary?.positive || 0 },
          { name: "부정적", value: result?.data?.summary?.negative || 0 },
          { name: "중립적", value: result?.data?.summary?.neutral || 0 }
        ])
      }
      setLoading(false)
    }

    fetchSentimentAnalysis()
  }, [videoId])

  if (loading) return <div>감성 분석 중...</div>
  if (error) return <div>에러: {error}</div>

  const COLORS = ["#0088FE", "#FF8042", "#FFBB28"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>댓글 감성 분석</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={sentimentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {sentimentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
