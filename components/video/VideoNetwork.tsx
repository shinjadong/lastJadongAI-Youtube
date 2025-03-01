"use client"

import { useState, useEffect, useMemo } from "react"
import type { YouTubeVideo } from "@/app/types/youtube"
import { Card, CardContent } from "@/components/common/ui"
import { formatNumber } from "@/lib/utils"

interface VideoNetworkProps {
  videos: YouTubeVideo[]
}

interface NetworkNode {
  id: string
  label: string
  value: number // 노드 크기 (조회수 기반)
}

interface NetworkLink {
  source: string
  target: string
  value: number // 연관도
}

interface NetworkData {
  nodes: NetworkNode[]
  links: NetworkLink[]
}

export function VideoNetwork({ videos }: VideoNetworkProps) {
  const [networkData, setNetworkData] = useState<NetworkData>({ nodes: [], links: [] })

  // 네트워크 데이터 계산
  const calculateNetwork = useMemo(() => {
    const nodes: NetworkNode[] = []
    const links: NetworkLink[] = []
    const processedVideos = new Set<string>()

    // 노드 생성
    videos.forEach(video => {
      const videoId = typeof video.id === 'string' ? video.id : video.id.videoId
      if (processedVideos.has(videoId)) return

      nodes.push({
        id: videoId,
        label: video.snippet.title,
        value: Number(video.statistics?.viewCount || 0)
      })

      processedVideos.add(videoId)
    })

    // 링크 생성 (태그 기반 연관도)
    for (let i = 0; i < videos.length; i++) {
      const videoA = videos[i]
      const videoAId = typeof videoA.id === 'string' ? videoA.id : videoA.id.videoId
      const tagsA = videoA.snippet.tags || []

      for (let j = i + 1; j < videos.length; j++) {
        const videoB = videos[j]
        const videoBId = typeof videoB.id === 'string' ? videoB.id : videoB.id.videoId
        const tagsB = videoB.snippet.tags || []

        // 공통 태그 수 계산
        const commonTags = tagsA.filter(tag => tagsB.includes(tag))
        if (commonTags.length > 0) {
          links.push({
            source: videoAId,
            target: videoBId,
            value: commonTags.length
          })
        }
      }
    }

    return { nodes, links }
  }, [videos])

  useEffect(() => {
    setNetworkData(calculateNetwork)
  }, [calculateNetwork])

  // 네트워크 시각화 로직
  const renderNetwork = () => {
    // 여기에 D3.js나 다른 네트워크 시각화 라이브러리를 사용할 수 있습니다.
    // 현재는 간단한 리스트로 표시
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">상위 연관 비디오</h4>
            <ul className="space-y-2">
              {networkData.links
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((link, index) => {
                  const sourceNode = networkData.nodes.find(n => n.id === link.source)
                  const targetNode = networkData.nodes.find(n => n.id === link.target)
                  return (
                    <li key={index} className="text-sm">
                      <div className="flex justify-between">
                        <span className="truncate">{sourceNode?.label} ↔ {targetNode?.label}</span>
                        <span className="text-muted-foreground ml-2">
                          공통 태그 {link.value}개
                        </span>
                      </div>
                    </li>
                  )
                })}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">인기 비디오</h4>
            <ul className="space-y-2">
              {networkData.nodes
                .sort((a, b) => b.value - a.value)
                .slice(0, 5)
                .map((node, index) => (
                  <li key={index} className="text-sm">
                    <div className="flex justify-between">
                      <span className="truncate">{node.label}</span>
                      <span className="text-muted-foreground ml-2">
                        {formatNumber(node.value)} 조회
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (networkData.nodes.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        네트워크 데이터가 없습니다.
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        {renderNetwork()}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {formatNumber(networkData.nodes.length)}개의 비디오, {formatNumber(networkData.links.length)}개의 연관 관계
        </div>
      </CardContent>
    </Card>
  )
} 