"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { YouTubeVideo } from "../types/youtube"
import { getVideoId } from "../utils/format"

interface IRelatedVideoNetworkProps {
  videos: YouTubeVideo[]
}

interface INetworkNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  views: number;
  type: string;
}

interface INetworkLink extends d3.SimulationLinkDatum<INetworkNode> {
  source: string | INetworkNode;
  target: string | INetworkNode;
  value: number;
}

export default function RelatedVideoNetwork({ videos }: IRelatedVideoNetworkProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || videos.length === 0) return

    // 기존 SVG 내용 제거
    d3.select(svgRef.current).selectAll("*").remove()

    const width = 600
    const height = 400

    // 노드 데이터 생성
    const nodes: INetworkNode[] = videos.map(video => ({
      id: getVideoId(video.id),
      title: video.snippet.title,
      views: Number(video.statistics?.viewCount || 0),
      type: "video",
      x: width / 2 + Math.random() * 50 - 25,
      y: height / 2 + Math.random() * 50 - 25
    }))

    // 링크 데이터 생성
    const links: INetworkLink[] = videos.slice(1).map(video => ({
      source: getVideoId(video.id),
      target: getVideoId(videos[0].id),
      value: Number(video.statistics?.viewCount || 0)
    }))

    // SVG 설정
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)

    // 시뮬레이션 설정
    const simulation = d3.forceSimulation<INetworkNode>(nodes)
      .force("link", d3.forceLink<INetworkNode, INetworkLink>(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))

    // 링크 그리기
    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", d => Math.sqrt(d.value) * 0.1)

    // 노드 그리기
    const node = svg.append("g")
      .selectAll<SVGCircleElement, INetworkNode>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => Math.sqrt(d.views) * 0.1 + 5)
      .attr("fill", "#69b3a2")
      .call((selection: d3.Selection<SVGCircleElement, INetworkNode, SVGGElement, unknown>) => {
        const dragBehavior = drag(simulation);
        (dragBehavior as any)(selection);
      });

    node.append("title")
      .text(d => d.title)

    // 시뮬레이션 업데이트
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as INetworkNode).x!)
        .attr("y1", d => (d.source as INetworkNode).y!)
        .attr("x2", d => (d.target as INetworkNode).x!)
        .attr("y2", d => (d.target as INetworkNode).y!)

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!)
    })

    // 드래그 기능
    function drag(simulation: d3.Simulation<INetworkNode, INetworkLink>) {
      function dragstarted(event: d3.D3DragEvent<SVGCircleElement, INetworkNode, INetworkNode>, d: INetworkNode) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      }

      function dragged(event: d3.D3DragEvent<SVGCircleElement, INetworkNode, INetworkNode>, d: INetworkNode) {
        d.fx = event.x
        d.fy = event.y
      }

      function dragended(event: d3.D3DragEvent<SVGCircleElement, INetworkNode, INetworkNode>, d: INetworkNode) {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }

      return d3.drag<SVGCircleElement, INetworkNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    }
  }, [videos])

  return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  )
}
