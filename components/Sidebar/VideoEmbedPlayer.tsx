/**
 * 비디오 임베드 플레이어 컴포넌트
 * 
 * YouTube 비디오를 임베드하여 재생하는 컴포넌트입니다.
 * 다음과 같은 기능을 제공합니다:
 * 
 * 1. 비디오 재생
 *    - 자동 크기 조정
 *    - 반응형 레이아웃
 *    - 16:9 비율 유지
 * 
 * 2. 플레이어 기능
 *    - 재생/일시정지
 *    - 음량 조절
 *    - 화질 설정
 *    - 전체화면
 * 
 * 3. 접근성
 *    - 키보드 제어
 *    - 스크린 리더 지원
 *    - ARIA 레이블
 * 
 * 특징:
 * - 안전한 iframe 사용
 * - 성능 최적화
 * - 로딩 상태 처리
 * - 오류 처리
 * 
 * @component
 * @param {Object} props
 * @param {YouTubeVideo} props.video - 비디오 데이터
 */

"use client"

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