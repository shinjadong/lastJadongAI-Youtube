// components/server/SearchResults.tsx
import { VideoList } from '@/components/client/VideoList';
import { connectToDatabase } from '@/lib/db';
import { KeywordHistory, Video } from '@/models';
import { AnalysisProgress } from '@/components/client/AnalysisProgress';

// 서버 컴포넌트는 'use client'를 사용하지 않음
export async function SearchResults({ 
  keyword, 
  round_no, 
  uid 
}: { 
  keyword: string; 
  round_no?: string; 
  uid: string 
}) {
  // 서버에서 직접 데이터베이스 연결
  await connectToDatabase();
  
  // 최신 검색 히스토리 조회
  let history;
  
  if (round_no) {
    // 특정 라운드의 검색 결과 조회
    history = await KeywordHistory.findOne({
      round_no,
      uid,
    });
  } else {
    // 해당 키워드의 최신 검색 결과 조회
    history = await KeywordHistory.findOne({
      keyword,
      uid,
    }).sort({ create_dt: -1 });
  }
  
  if (!history) {
    // 이전 검색 기록이 없는 경우 - 초기 상태
    return (
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          키워드 "{keyword}"에 대한 검색 기록이 없습니다.
        </p>
      </div>
    );
  }
  
  // 프로세싱 상태 확인
  if (history.status === "0") {
    // 진행 중인 검색
    return (
      <div className="mt-8">
        <AnalysisProgress keyword={keyword} roundNo={history.round_no} />
      </div>
    );
  }
  
  if (history.status === "2") {
    // 오류 발생
    return (
      <div className="mt-8 text-center">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-medium">처리 중 오류가 발생했습니다</p>
          <p className="text-sm mt-2">다시 시도해주세요</p>
        </div>
      </div>
    );
  }
  
  // 비디오 목록 조회
  const videos = await Video.find({
    round_no: history.round_no,
    uid,
  }).sort({ viewCount: -1 });
  
  // 관련 키워드
  const relatedKeywords = history.recKeywords || [];
  
  // 클라이언트 컴포넌트에 props 전달
  return (
    <div className="mt-8">
      <VideoList 
        videos={JSON.parse(JSON.stringify(videos))} 
        relatedKeywords={relatedKeywords}
        historyId={history._id.toString()}
        roundNo={history.round_no}
      />
    </div>
  );
}

