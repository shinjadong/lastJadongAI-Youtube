/**
 * 비디오 댓글 분석 컴포넌트
 * 
 * 비디오 댓글을 분석하고 인사이트를 제공하는 컴포넌트입니다.
 * 다음과 같은 기능을 제공합니다:
 * 
 * 1. 베스트 댓글 표시
 *    - 좋아요 수가 많은 상위 3개 댓글
 * 
 * 2. 전체 댓글 목록
 *    - 관련성 높은 순으로 정렬된 댓글
 * 
 * 특징:
 * - 실시간 데이터 로딩
 * - 댓글 필터링
 * 
 * @component
 * @param {Object} props
 * @param {YouTubeVideo} props.video - 비디오 데이터
 * @param {Object} props.commentData - 댓글 데이터 (API에서 가져온 데이터)
 */

"use client"

import { useState, useEffect } from "react"
import type { YouTubeVideo, Comment } from "@/types/youtube"
import { analyzeCommentSentiment, getVideoId } from "@/lib/youtube"

// UI 컴포넌트 임포트
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// 아이콘 임포트
import { 
  Loader2,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Clock,
  Trophy
} from "lucide-react"

// 유틸리티 임포트
import { formatDate, formatNumber } from "@/lib/utils"

interface VideoCommentAnalysisProps {
  video: YouTubeVideo;
  commentData?: any;
}

export function VideoCommentAnalysis({ video, commentData }: VideoCommentAnalysisProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [bestComments, setBestComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("best");

  // commentData가 제공되면 사용하고, 그렇지 않으면 API에서 가져옴
  useEffect(() => {
    if (commentData) {
      setComments(commentData.items || []);
      setBestComments(commentData.bestComments || []);
    }
  }, [commentData]);

  const handleAnalyzeComments = async () => {
    // commentData가 있으면 다시 가져올 필요 없음
    if (commentData) {
      setComments(commentData.items || []);
      setBestComments(commentData.bestComments || []);
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeCommentSentiment(getVideoId(video.id));
      
      if (result.error) {
        setError(result.error);
      } else {
        setComments(result.comments || []);
        // 베스트 댓글 선별 (좋아요 순)
        const sortedComments = [...(result.comments || [])]
          .sort((a: any, b: any) => b.snippet.likeCount - a.snippet.likeCount)
          .slice(0, 3);
        setBestComments(sortedComments);
      }
    } catch (error) {
      setError('댓글을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>댓글 분석 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>댓글을 가져올 수 없습니다</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // 댓글 데이터가 있는 경우
  if ((comments.length > 0 || bestComments.length > 0) || (commentData?.message)) {
    // 대체 메시지가 있는 경우 (API 오류 등)
    if (commentData?.message) {
      return (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>알림</AlertTitle>
            <AlertDescription>{commentData.message}</AlertDescription>
          </Alert>
          <Button onClick={handleAnalyzeComments} className="w-full">
            분석 다시 시도
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="best">
              베스트 댓글 ({bestComments.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              전체 댓글 ({comments.length})
            </TabsTrigger>
          </TabsList>

          {/* 베스트 댓글 탭 */}
          <TabsContent value="best" className="mt-4">
            {bestComments.length > 0 ? (
              <div className="space-y-4">
                {bestComments.map((comment, index) => (
                  <Card key={comment.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className={`h-5 w-5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                        <CardTitle className="text-sm">베스트 댓글 #{index + 1}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.snippet.authorProfileImageUrl || ""} />
                          <AvatarFallback>{comment.snippet.authorDisplayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{comment.snippet.authorDisplayName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                <span>{formatNumber(comment.snippet.likeCount)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>{formatDate(comment.snippet.publishedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm">{comment.snippet.textDisplay}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  베스트 댓글이 없습니다.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* 전체 댓글 탭 */}
          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg border">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.snippet.authorProfileImageUrl || ""} />
                      <AvatarFallback>{comment.snippet.authorDisplayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{comment.snippet.authorDisplayName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            <span>{formatNumber(comment.snippet.likeCount)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(comment.snippet.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm">{comment.snippet.textDisplay}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Button onClick={handleAnalyzeComments} disabled={loading}>
        {loading ? "분석 중..." : "댓글 분석 시작"}
      </Button>
      <p className="text-sm text-muted-foreground mt-2">
        * 댓글이 없는 영상은 분석할 수 없습니다.
      </p>
    </div>
  );
} 