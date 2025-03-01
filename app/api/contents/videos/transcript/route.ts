import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import axios from "axios";

/**
 * 비디오 트랜스크립트(자막)를 가져오는 API 엔드포인트
 * 
 * @param req 요청 객체
 * @returns 트랜스크립트 정보
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
      // 1. 비디오의 캡션 트랙 목록 가져오기
      const captionListResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/captions`,
        {
          params: {
            part: "snippet",
            videoId: videoId,
            key: process.env.YOUTUBE_API_KEY,
          },
          headers: {
            Authorization: process.env.YOUTUBE_ACCESS_TOKEN ? `Bearer ${process.env.YOUTUBE_ACCESS_TOKEN}` : undefined,
          },
        }
      );

      // 캡션 트랙이 없거나 접근 권한이 없는 경우 대체 방법 사용
      if (!captionListResponse.data.items || captionListResponse.data.items.length === 0) {
        // 대체 방법: 비디오 정보에서 자막 여부 확인
        const videoResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/videos`,
          {
            params: {
              part: "snippet,contentDetails",
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
        const hasCaptions = videoData.contentDetails.caption === "true";

        if (!hasCaptions) {
          return NextResponse.json(
            { error: "이 비디오에는 자막이 없습니다." },
            { status: 404 }
          );
        }

        // 자막이 있지만 API로 직접 접근할 수 없는 경우
        // 서드파티 서비스를 사용하거나 대체 메시지 제공
        return NextResponse.json({
          status: "success",
          data: {
            transcript: "이 비디오의 자막은 API 접근 권한 제한으로 가져올 수 없습니다. 상세 분석을 신청하시면 전체 자막을 분석해 드립니다.",
            segments: [],
            language: "unknown",
          },
        }, { status: 200 });
      }

      // 2. 선호하는 언어 순서대로 캡션 트랙 선택
      const preferredLanguages = ["ko", "en", "auto"];
      let selectedCaption = null;

      for (const lang of preferredLanguages) {
        const caption = captionListResponse.data.items.find((item: any) => 
          item.snippet.language === lang || 
          (lang === "auto" && item.snippet.trackKind === "ASR")
        );
        
        if (caption) {
          selectedCaption = caption;
          break;
        }
      }

      // 선택된 캡션이 없으면 첫 번째 캡션 사용
      if (!selectedCaption && captionListResponse.data.items.length > 0) {
        selectedCaption = captionListResponse.data.items[0];
      }

      if (!selectedCaption) {
        return NextResponse.json(
          { error: "이 비디오에는 자막이 없습니다." },
          { status: 404 }
        );
      }

      // 3. 캡션 내용 가져오기 (OAuth 토큰 필요)
      if (!process.env.YOUTUBE_ACCESS_TOKEN) {
        // OAuth 토큰이 없는 경우 대체 메시지 제공
        return NextResponse.json({
          status: "success",
          data: {
            transcript: "자막 내용을 가져오기 위해서는 YouTube OAuth 인증이 필요합니다. 상세 분석을 신청하시면 전체 자막을 분석해 드립니다.",
            segments: [],
            language: selectedCaption.snippet.language || "unknown",
          },
        }, { status: 200 });
      }

      try {
        const captionResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/captions/${selectedCaption.id}`,
          {
            params: {
              tfmt: "srt",
              key: process.env.YOUTUBE_API_KEY,
            },
            headers: {
              Authorization: `Bearer ${process.env.YOUTUBE_ACCESS_TOKEN}`,
            },
          }
        );

        // SRT 형식 파싱
        const srtContent = captionResponse.data;
        const segments = parseSRT(srtContent);
        const fullText = segments.map(segment => segment.text).join(" ");

        return NextResponse.json({
          status: "success",
          data: {
            transcript: fullText,
            segments: segments,
            language: selectedCaption.snippet.language || "unknown",
          },
        }, { status: 200 });
      } catch (captionError) {
        console.error("캡션 내용 가져오기 오류:", captionError);
        
        // 캡션 내용을 가져오지 못한 경우 대체 메시지 제공
        return NextResponse.json({
          status: "success",
          data: {
            transcript: "자막 내용을 가져오는 중 오류가 발생했습니다. 상세 분석을 신청하시면 전체 자막을 분석해 드립니다.",
            segments: [],
            language: selectedCaption.snippet.language || "unknown",
          },
        }, { status: 200 });
      }
    } catch (apiError: any) {
      console.error("YouTube API 호출 오류:", apiError);
      
      // API 오류 발생 시 대체 메시지 제공
      return NextResponse.json({
        status: "success",
        data: {
          transcript: "알고리즘 분석 중입니다. 상세 분석을 신청하시면 전체 자막을 분석해 드립니다.",
          segments: [],
          language: "unknown",
        },
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error("트랜스크립트 가져오기 오류:", error);
    return NextResponse.json(
      { error: "트랜스크립트를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * SRT 형식의 자막을 파싱하는 함수
 * 
 * @param srtContent SRT 형식의 자막 내용
 * @returns 파싱된 자막 세그먼트 배열
 */
function parseSRT(srtContent: string) {
  const segments: { text: string; start: number; end: number }[] = [];
  const blocks = srtContent.trim().split(/\r?\n\r?\n/);

  for (const block of blocks) {
    const lines = block.split(/\r?\n/);
    if (lines.length < 3) continue;

    // 타임코드 파싱
    const timecodeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    if (!timecodeMatch) continue;

    const startHours = parseInt(timecodeMatch[1], 10);
    const startMinutes = parseInt(timecodeMatch[2], 10);
    const startSeconds = parseInt(timecodeMatch[3], 10);
    const startMilliseconds = parseInt(timecodeMatch[4], 10);
    
    const endHours = parseInt(timecodeMatch[5], 10);
    const endMinutes = parseInt(timecodeMatch[6], 10);
    const endSeconds = parseInt(timecodeMatch[7], 10);
    const endMilliseconds = parseInt(timecodeMatch[8], 10);

    const startTime = startHours * 3600 + startMinutes * 60 + startSeconds + startMilliseconds / 1000;
    const endTime = endHours * 3600 + endMinutes * 60 + endSeconds + endMilliseconds / 1000;

    // 텍스트 추출
    const text = lines.slice(2).join(" ");

    segments.push({
      text,
      start: startTime,
      end: endTime,
    });
  }

  return segments;
} 