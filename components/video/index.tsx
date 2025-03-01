/**
 * 비디오 목록 컨테이너 컴포넌트
 * 
 * 검색된 비디오 목록을 그리드 또는 리스트 형태로 표시하는 컨테이너 컴포넌트입니다.
 * 다음과 같은 기능을 제공합니다:
 * 
 * 1. 뷰 모드 전환
 *    - 그리드 뷰: 썸네일 중심의 카드 레이아웃
 *    - 리스트 뷰: 상세 정보 중심의 테이블 레이아웃
 * 
 * 2. 비디오 선택
 *    - 단일 비디오 선택
 *    - 다중 비디오 선택 (리스트 뷰)
 *    - 선택 비디오 사이드바 표시
 * 
 * 3. 레이아웃 최적화
 *    - 반응형 그리드 시스템
 *    - 무한 스크롤 지원
 *    - 로딩 상태 표시
 * 
 * @component
 * @param {Object} props
 * @param {YouTubeVideo[]} props.videos - 표시할 비디오 목록
 * @param {(video: YouTubeVideo) => void} props.onVideoSelect - 비디오 선택 핸들러
 */

"use client"

import { useState } from "react"
import type { YouTubeVideo } from "@/types/youtube"
import { Button } from "@/components/ui/button"
import { LayoutGrid, LayoutList } from "lucide-react"
import { GridView } from "./GridView"
import { ListView } from "./ListView"

type ViewMode = "grid" | "list"

interface VideoListProps {
  videos: YouTubeVideo[]
  onVideoSelect: (video: YouTubeVideo) => void
}

export function VideoList({ videos, onVideoSelect }: VideoListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")

  return (
    <div className="space-y-4">
      {/* 뷰 모드 토글 */}
      <div className="flex justify-end gap-2">
        <Button
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("grid")}
          title="그리드 뷰"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setViewMode("list")}
          title="리스트 뷰"
        >
          <LayoutList className="h-4 w-4" />
        </Button>
      </div>

      {/* 비디오 목록 */}
      {videos.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 bg-muted/50 rounded-lg">
          <p className="text-lg font-medium">검색 결과가 없습니다</p>
          <p className="text-sm mt-2">다른 검색어로 시도해보세요</p>
        </div>
      ) : viewMode === "grid" ? (
        <GridView videos={videos} onVideoSelect={onVideoSelect} />
      ) : (
        <ListView videos={videos} onVideoSelect={onVideoSelect} />
      )}
    </div>
  )
} 