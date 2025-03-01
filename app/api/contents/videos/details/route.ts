import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";

/**
 * 비디오 상세 정보를 가져오는 API 엔드포인트
 * 
 * @param req 요청 객체
 * @returns 비디오 상세 정보
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
    const videoId = url.searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    try {
      // 1. 비디오 상세 정보 가져오기
      const videoResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos`,
        {
          params: {
            part: "snippet,contentDetails,statistics",
            id: videoId,
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );

      if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
        return NextResponse.json(
          { error: "비디오를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      const videoData = videoResponse.data.items[0];
      const channelId = videoData.snippet.channelId;

      // 2. 채널 정보 가져오기
      const channelResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/channels`,
        {
          params: {
            part: "snippet,statistics",
            id: channelId,
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );

      const channelData = channelResponse.data.items[0];

      // 3. 댓글 정보 가져오기 (최대 20개)
      let commentsData = [];
      try {
        const commentsResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/commentThreads`,
          {
            params: {
              part: "snippet,replies",
              videoId: videoId,
              maxResults: 20,
              order: "relevance",
              key: process.env.YOUTUBE_API_KEY,
            },
          }
        );

        if (commentsResponse.data.items && commentsResponse.data.items.length > 0) {
          commentsData = commentsResponse.data.items.map((item: any) => {
            const comment = item.snippet.topLevelComment;
            
            return {
              id: comment.id,
              snippet: comment.snippet,
              replies: item.replies ? item.replies.comments : []
            };
          });
        }
      } catch (commentError) {
        console.error("댓글 가져오기 오류:", commentError);
        // 댓글 가져오기 실패해도 전체 응답은 계속 진행
      }

      // 베스트 댓글 선별 (좋아요 순)
      const bestComments = [...commentsData]
        .sort((a: any, b: any) => b.snippet.likeCount - a.snippet.likeCount)
        .slice(0, 3);

      // 4. 성과도 및 기여도 계산
      const viewCount = parseInt(videoData.statistics.viewCount || "0", 10);
      const subscriberCount = parseInt(channelData.statistics.subscriberCount || "0", 10);
      const totalVideos = parseInt(channelData.statistics.videoCount || "1", 10);
      const channelTotalViews = parseInt(channelData.statistics.viewCount || "0", 10);
      const averageViews = channelTotalViews / totalVideos;
      
      // 후킹지수 계산 (구독자 대비 조회수)
      let performance = "Normal";
      const performanceRatio = subscriberCount > 0 ? (viewCount / subscriberCount) * 100 : 0;
      if (performanceRatio > 50) performance = "Good";
      else if (performanceRatio < 10) performance = "Bad";
      else if (performanceRatio < 5) performance = "Worst";
      
      // 성장지수 계산 (평균 조회수 대비 조회수)
      let contribution = "Normal";
      const contributionRatio = averageViews > 0 ? (viewCount / averageViews) * 100 : 0;
      if (contributionRatio > 150) contribution = "Good";
      else if (contributionRatio < 50) contribution = "Bad";
      else if (contributionRatio < 25) contribution = "Worst";

      // 5. 응답 데이터 구성
      const responseData = {
        video: {
          id: videoData.id,
          snippet: videoData.snippet,
          contentDetails: videoData.contentDetails,
          statistics: videoData.statistics,
          performance: performance,
          contribution: contribution,
          exposureProbability: Math.min(performanceRatio, 100),
        },
        channel: {
          id: channelData.id,
          snippet: channelData.snippet,
          statistics: channelData.statistics,
          averageViews: averageViews,
        },
        comments: {
          items: commentsData,
          bestComments: bestComments,
          total: commentsData.length
        }
      };

      return NextResponse.json({
        status: "success",
        data: responseData,
      }, { status: 200 });
    } catch (apiError: any) {
      console.error("YouTube API 호출 오류:", apiError);
      return NextResponse.json(
        { error: "비디오 상세 정보를 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("비디오 상세 정보 가져오기 오류:", error);
    return NextResponse.json(
      { error: "비디오 상세 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 