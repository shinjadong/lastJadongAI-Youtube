"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../../../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../../components/ui/card"
import type { YouTubeVideo } from "../types/youtube"
import { formatDate, formatNumber, getVideoId } from "../utils/format" // Updated import

interface VideoModalProps {
  video: YouTubeVideo | null
  open: boolean
  onClose: () => void
}

export default function VideoModal({ video, open, onClose }: VideoModalProps) {
  if (!video) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{video.snippet.title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList>
            <TabsTrigger value="info">영상 정보</TabsTrigger>
            <TabsTrigger value="stats">상세 통계</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${getVideoId(video.id)}`}
                title={video.snippet.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>기본 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">채널</dt>
                      <dd>{video.snippet.channelTitle}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">업로드 날짜</dt>
                      <dd>{formatDate(video.snippet.publishedAt)}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>통계</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">조회수</dt>
                      <dd>{formatNumber(Number(video.statistics?.viewCount || 0))}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">좋아요</dt>
                      <dd>{formatNumber(Number(video.statistics?.likeCount || 0))}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">댓글</dt>
                      <dd>{formatNumber(Number(video.statistics?.commentCount || 0))}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>성과 지표</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">조회수 평가</dt>
                      <dd>Good</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">참여도</dt>
                      <dd>Good</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

