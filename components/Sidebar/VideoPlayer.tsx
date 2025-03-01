"use client"

// 타입 임포트
import type { YouTubeVideo } from "@/types/youtube"

interface VideoPlayerProps {
  video: YouTubeVideo
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const getVideoId = (id: string | { kind: string; videoId: string }): string => {
    return typeof id === 'string' ? id : id.videoId
  }

  return (
    <div className="aspect-video">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${getVideoId(video.id)}`}
        allowFullScreen
        className="rounded-lg"
      />
    </div>
  )
} 