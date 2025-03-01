/**
 * YouTube 관련 유틸리티 함수
 */

import type { YouTubeVideo, ChannelDetails } from "@/types/youtube";
import axios from "axios";

/**
 * 채널 상세 정보를 가져오는 함수
 * @param channelId 채널 ID
 * @returns 채널 상세 정보
 */
export async function getChannelDetails(channelId: string): Promise<any> {
  try {
    // 백엔드 API 호출
    const response = await axios.get(`/api/contents/channels?channelId=${channelId}`);
    
    // API 응답이 성공적이면 데이터 반환
    if (response.data && response.data.status === "success") {
      return response.data.data;
    }
    
    // 응답이 없거나 오류가 있는 경우 기본 데이터 반환
    console.warn("채널 정보 API 응답이 올바르지 않습니다. 기본 데이터를 사용합니다.");
    return {
      items: [
        {
          id: channelId,
          snippet: {
            title: "채널 이름",
            description: "채널 설명",
            thumbnails: {
              default: { url: "https://via.placeholder.com/88x88", width: 88, height: 88 },
              medium: { url: "https://via.placeholder.com/240x240", width: 240, height: 240 },
              high: { url: "https://via.placeholder.com/800x800", width: 800, height: 800 },
            },
            publishedAt: new Date().toISOString(),
          },
          statistics: {
            viewCount: "1000000",
            subscriberCount: "10000",
            hiddenSubscriberCount: false,
            videoCount: "100",
          },
        },
      ],
    };
  } catch (error) {
    console.error("채널 정보 가져오기 오류:", error);
    return { error: "채널 정보를 가져오는 중 오류가 발생했습니다." };
  }
}

/**
 * 후킹지수를 계산하는 함수
 * @param viewCount 조회수
 * @param subscriberCount 구독자 수
 * @returns 후킹지수 (0-100)
 */
export function calculatePerformance(viewCount: number, subscriberCount: number): number {
  if (subscriberCount === 0) return 0;
  
  // 구독자 대비 조회수 비율 (%)
  const ratio = (viewCount / subscriberCount) * 100;
  
  // 최대 100%로 제한
  return Math.min(ratio, 100);
}

/**
 * 성장지수를 계산하는 함수
 * @param video 비디오 정보
 * @param averageViews 채널 평균 조회수
 * @returns 성장지수 (0-100)
 */
export function calculateContribution(video: YouTubeVideo, averageViews: number): number {
  if (averageViews === 0) return 0;
  
  const viewCount = Number(video.statistics?.viewCount || video.views || 0);
  
  // 평균 조회수 대비 비율 (%)
  const ratio = (viewCount / averageViews) * 100;
  
  // 최대 100%로 제한
  return Math.min(ratio, 100);
}

/**
 * 비디오 트랜스크립트(자막)를 가져오는 함수
 * @param videoId 비디오 ID
 * @returns 트랜스크립트 정보
 */
export async function extractTranscript(videoId: string): Promise<any> {
  try {
    // 백엔드 API 호출
    const response = await axios.get(`/api/contents/videos/transcript?videoId=${videoId}`);
    
    // API 응답 확인
    if (response.data && response.data.status === "success") {
      return response.data.data;
    }
    
    // 응답이 없거나 오류가 있는 경우
    return { error: "트랜스크립트 데이터를 가져올 수 없습니다." };
  } catch (error) {
    console.error("트랜스크립트 가져오기 오류:", error);
    return { error: "트랜스크립트를 가져오는 중 오류가 발생했습니다." };
  }
}

/**
 * 비디오 AI 분석 결과를 가져오는 함수
 * @param videoId 비디오 ID
 * @returns AI 분석 결과
 */
export async function analyzeVideo(videoId: string): Promise<any> {
  try {
    // 백엔드 API 호출
    const response = await axios.get(`/api/contents/videos/analyze?videoId=${videoId}`);
    
    // API 응답 확인
    if (response.data && response.data.status === "success") {
      return response.data.data;
    }
    
    // 응답이 없거나 오류가 있는 경우
    return { error: "AI 분석 결과를 가져올 수 없습니다." };
  } catch (error) {
    console.error("비디오 분석 오류:", error);
    return { error: "비디오 분석 중 오류가 발생했습니다." };
  }
}

/**
 * 댓글 감성 분석 결과를 가져오는 함수
 * @param videoId 비디오 ID
 * @returns 댓글 감성 분석 결과
 */
export async function analyzeCommentSentiment(videoId: string): Promise<any> {
  try {
    // 백엔드 API 호출
    const response = await axios.get(`/api/contents/videos/comments?videoId=${videoId}`);
    
    // API 응답 확인
    if (response.data && response.data.status === "success") {
      return response.data.data;
    }
    
    // 응답이 없거나 오류가 있는 경우
    return { error: "댓글 감성 분석 결과를 가져올 수 없습니다." };
  } catch (error) {
    console.error("댓글 감성 분석 오류:", error);
    return { error: "댓글 감성 분석 중 오류가 발생했습니다." };
  }
}

/**
 * 비디오 상세 정보를 가져오는 함수
 * @param videoId 비디오 ID
 * @returns 비디오 상세 정보
 */
export async function getVideoDetails(videoId: string): Promise<any> {
  try {
    // 백엔드 API 호출
    const response = await axios.get(`/api/contents/videos/details?videoId=${videoId}`);
    
    // API 응답 확인
    if (response.data && response.data.status === "success") {
      return response.data.data;
    }
    
    // 응답이 없거나 오류가 있는 경우
    return { error: "비디오 상세 정보를 가져올 수 없습니다." };
  } catch (error) {
    console.error("비디오 상세 정보 가져오기 오류:", error);
    return { error: "비디오 상세 정보를 가져오는 중 오류가 발생했습니다." };
  }
}

/**
 * 비디오 ID를 추출하는 함수
 * @param id 비디오 ID (문자열 또는 객체)
 * @returns 비디오 ID 문자열
 */
export function getVideoId(id: string | { kind: string; videoId: string }): string {
  return typeof id === 'string' ? id : id.videoId;
}

/**
 * 비디오 검색 결과를 가져오는 함수
 * @param keyword 검색 키워드
 * @param maxResults 최대 결과 수
 * @returns 검색 결과
 */
export async function searchVideos(keyword: string, maxResults: number = 20): Promise<any> {
  try {
    // 백엔드 API 호출
    const response = await axios.get(`/api/contents/videos/search`, {
      params: {
        keyword,
        maxResults
      }
    });
    
    // API 응답 확인
    if (response.data && response.data.status === "success") {
      return response.data.data;
    }
    
    // 응답이 없거나 오류가 있는 경우
    return { error: "비디오 검색 결과를 가져올 수 없습니다." };
  } catch (error) {
    console.error("비디오 검색 오류:", error);
    return { error: "비디오 검색 중 오류가 발생했습니다." };
  }
}

/**
 * 비디오 성과 지표를 가져오는 함수
 * @param videoId 비디오 ID
 * @returns 성과 지표
 */
export async function getVideoPerformanceMetrics(videoId: string): Promise<any> {
  try {
    // 백엔드 API 호출
    const response = await axios.get(`/api/contents/videos/metrics?videoId=${videoId}`);
    
    // API 응답 확인
    if (response.data && response.data.status === "success") {
      return response.data.data;
    }
    
    // 응답이 없거나 오류가 있는 경우
    return { error: "비디오 성과 지표를 가져올 수 없습니다." };
  } catch (error) {
    console.error("비디오 성과 지표 가져오기 오류:", error);
    return { error: "비디오 성과 지표를 가져오는 중 오류가 발생했습니다." };
  }
} 