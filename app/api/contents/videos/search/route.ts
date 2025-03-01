import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";
import { convertToYouTubeVideo } from "@/types/youtube";

/**
 * YouTube 비디오 검색 API 엔드포인트
 * 
 * @param req 요청 객체
 * @returns 검색 결과
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const keyword = url.searchParams.get("keyword");
    const maxResults = url.searchParams.get("maxResults") || "20";
    const pageToken = url.searchParams.get("pageToken") || "";

    if (!keyword) {
      return NextResponse.json(
        { error: "keyword 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    // YouTube API를 사용하여 비디오 검색
    try {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/search`,
        {
          params: {
            part: "snippet",
            q: keyword,
            maxResults: maxResults,
            pageToken: pageToken,
            type: "video",
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );

      // 검색 결과가 없는 경우
      if (!response.data.items || response.data.items.length === 0) {
        return NextResponse.json({
          status: "success",
          data: {
            videos: [],
            nextPageToken: null,
            totalResults: 0,
          },
        }, { status: 200 });
      }

      // 비디오 ID 목록 추출
      const videoIds = response.data.items.map((item: any) => item.id.videoId).join(",");

      // 비디오 상세 정보 가져오기
      const videoDetailsResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos`,
        {
          params: {
            part: "snippet,contentDetails,statistics",
            id: videoIds,
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );

      // 채널 ID 목록 추출
      const channelIds = [...new Set(videoDetailsResponse.data.items.map((item: any) => item.snippet.channelId))].join(",");

      // 채널 정보 가져오기
      const channelResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/channels`,
        {
          params: {
            part: "snippet,statistics",
            id: channelIds,
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );

      // 채널 정보 맵 생성
      const channelMap = new Map();
      channelResponse.data.items.forEach((channel: any) => {
        channelMap.set(channel.id, {
          subscriberCount: channel.statistics.subscriberCount,
          viewCount: channel.statistics.viewCount,
          videoCount: channel.statistics.videoCount,
        });
      });

      // 비디오 정보와 채널 정보 결합
      const videos = videoDetailsResponse.data.items.map((video: any) => {
        const channelInfo = channelMap.get(video.snippet.channelId) || {
          subscriberCount: "0",
          viewCount: "0",
          videoCount: "0",
        };

        // 성과도 및 기여도 계산
        const viewCount = parseInt(video.statistics.viewCount || "0", 10);
        const subscriberCount = parseInt(channelInfo.subscriberCount || "0", 10);
        const averageViews = parseInt(channelInfo.viewCount || "0", 10) / parseInt(channelInfo.videoCount || "1", 10);
        
        // 성과도 계산 (구독자 대비 조회수)
        let performance = "Normal";
        const performanceRatio = subscriberCount > 0 ? (viewCount / subscriberCount) * 100 : 0;
        if (performanceRatio > 50) performance = "Good";
        else if (performanceRatio < 10) performance = "Bad";
        else if (performanceRatio < 5) performance = "Worst";
        
        // 기여도 계산 (평균 조회수 대비 조회수)
        let contribution = "Normal";
        const contributionRatio = averageViews > 0 ? (viewCount / averageViews) * 100 : 0;
        if (contributionRatio > 150) contribution = "Good";
        else if (contributionRatio < 50) contribution = "Bad";
        else if (contributionRatio < 25) contribution = "Worst";

        return {
          _id: video.id,
          videoId: video.id,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.high.url,
          duration: video.contentDetails.duration,
          views: parseInt(video.statistics.viewCount || "0", 10),
          subscribers: parseInt(channelInfo.subscriberCount || "0", 10),
          contribution: contribution,
          performance: performance,
          exposureProbability: Math.min(performanceRatio, 100),
          totalVideos: parseInt(channelInfo.videoCount || "0", 10),
          publishDate: video.snippet.publishedAt,
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
          keyword: keyword,
          round_no: "search",
          uid: session.user.uid,
        };
      });

      return NextResponse.json({
        status: "success",
        data: {
          videos: videos,
          nextPageToken: response.data.nextPageToken || null,
          totalResults: response.data.pageInfo.totalResults,
          keyword: keyword,
        },
      }, { status: 200 });
    } catch (apiError: any) {
      console.error("YouTube API 호출 오류:", apiError);
      return NextResponse.json(
        { error: "비디오 검색 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("비디오 검색 오류:", error);
    return NextResponse.json(
      { error: "비디오 검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 