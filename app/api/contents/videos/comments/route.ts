import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";

/**
 * 비디오 댓글 및 베스트 댓글 API 엔드포인트
 * 
 * @param req 요청 객체
 * @returns 댓글 및 베스트 댓글 결과
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
    const maxResults = url.searchParams.get("maxResults") || "50";

    if (!videoId) {
      return NextResponse.json(
        { error: "videoId 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    try {
      // 1. 비디오 댓글 가져오기
      const commentsResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/commentThreads`,
        {
          params: {
            part: "snippet,replies",
            videoId: videoId,
            maxResults: maxResults,
            order: "relevance", // 관련성 높은 순으로 정렬
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );

      // 댓글이 없는 경우
      if (!commentsResponse.data.items || commentsResponse.data.items.length === 0) {
        return NextResponse.json({
          status: "success",
          data: {
            comments: [],
            bestComments: [],
            total: 0,
          },
        }, { status: 200 });
      }

      // 2. 댓글 데이터 처리
      const comments = commentsResponse.data.items.map((item: any) => {
        const comment = item.snippet.topLevelComment;
        
        return {
          id: comment.id,
          kind: comment.kind,
          etag: comment.etag,
          snippet: comment.snippet,
          replies: item.replies ? item.replies.comments : []
        };
      });

      // 3. 베스트 댓글 선별 (좋아요 순)
      const bestComments = [...comments]
        .sort((a: any, b: any) => b.snippet.likeCount - a.snippet.likeCount)
        .slice(0, 3);

      return NextResponse.json({
        status: "success",
        data: {
          comments: comments,
          bestComments: bestComments,
          total: comments.length,
        },
      }, { status: 200 });
    } catch (apiError: any) {
      console.error("YouTube API 호출 오류:", apiError);
      
      // API 오류 발생 시 대체 메시지 제공
      return NextResponse.json({
        status: "success",
        data: {
          comments: [],
          bestComments: [],
          total: 0,
          message: "알고리즘 분석 중입니다. 상세 분석을 신청하시면 베스트 댓글 분석 결과를 제공해 드립니다."
        },
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error("댓글 분석 오류:", error);
    return NextResponse.json(
      { error: "댓글 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 