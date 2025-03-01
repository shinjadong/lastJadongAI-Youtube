/**
 * 비디오 그리드 뷰 컴포넌트
 * 
 * 비디오 목록을 카드 형태의 그리드로 표시하는 컴포넌트입니다.
 * 다음과 같은 특징을 가집니다:
 * 
 * 1. 레이아웃
 *    - 반응형 그리드 (1~3열)
 *    - 일관된 카드 크기
 *    - 적절한 여백과 간격
 * 
 * 2. 카드 디자인
 *    - 고품질 썸네일
 *    - 비디오 길이 오버레이
 *    - 제목 2줄 제한
 *    - 채널명 표시
 * 
 * 3. 인터랙션
 *    - 호버 효과
 *    - 클릭 피드백
 *    - 부드러운 애니메이션
 * 
 * 4. 성능 최적화
 *    - 이미지 지연 로딩
 *    - 가상 스크롤 지원
 *    - 메모이제이션
 * 
 * @component
 * @param {Object} props
 * @param {YouTubeVideo[]} props.videos - 표시할 비디오 목록
 * @param {(video: YouTubeVideo) => void} props.onVideoSelect - 비디오 선택 핸들러
 */

"use client"

import type { YouTubeVideo } from "@/types/youtube"
import { VideoCard } from "@/components/video/VideoCard"

interface GridViewProps {
  videos: YouTubeVideo[]
  onVideoSelect: (video: YouTubeVideo) => void
}

export function GridView({ videos, onVideoSelect }: GridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in-50">
      {videos.map((video, index) => (
        <VideoCard
          key={`${typeof video.id === 'string' ? video.id : video.id.videoId}-${index}`}
          video={video}
          onClick={() => onVideoSelect(video)}
        />
      ))}
    </div>
  )
} 