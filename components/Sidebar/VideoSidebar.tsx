"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, AlertCircle, Loader2 } from "lucide-react"
import type { YouTubeVideo, CommentThread, VideoId } from "@/types/youtube"
import { formatNumber, formatDate, getPerformanceGrade, getContributionGrade } from "@/lib/utils"
import { getVideoComments, getChannelDetails, analyzeVideo, getChannelVideos, calculatePerformance, calculateContribution, analyzeCommentSentiment, extractTranscript } from "../../../actions/youtube"
import VideoPerformanceChart from "./youtube/video/VideoPerformanceChart"
import CommentSentimentAnalysis from "./CommentSentimentAnalysis"
import ChannelGrowthChart from "./ChannelGrowthChart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from "recharts"
import TagCloud from "./TagCloud"
import RelatedVideoNetwork from "./RelatedVideoNetwork"
import ChannelVideosTable from "./ChannelVideosTable"
import TagAnalysis from "./TagAnalysis"
import ThumbnailAnalysis from "./ThumbnailAnalysis"
import NeuralNetworkGraph from "./NeuralNetworkGraph"
import { Progress } from "@/components/ui/progress"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"

interface VideoSidebarProps {
  video: YouTubeVideo | null
  onClose: () => void
}

// 비디오 ID 타입 가드
const isVideoId = (id: any): id is VideoId => {
  return id && typeof id === 'object' && 'kind' in id && 'videoId' in id;
};

// 비디오 ID 추출 헬퍼 함수
const getVideoId = (id: string | VideoId): string => {
  if (typeof id === 'string') {
    return id;
  }
  return id.videoId;
};

// 텍스트 애니메이션 컴포넌트
const AnimatedText = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn(
      "animate-typing overflow-hidden whitespace-nowrap border-r-4 border-r-primary",
      "font-mono text-lg",
      className
    )}>
      {children}
    </div>
  );
};

const tabs = [
  { value: "performance", label: "성과 분석" },
  { value: "ai", label: "AI 분석" },
  { value: "funnel", label: "퍼널 신경망" },
  { value: "channel", label: "채널" },
]

export default function VideoSidebar({ video, onClose }: VideoSidebarProps) {
  const [comments, setComments] = useState<CommentThread[]>([])
  const [channelDetails, setChannelDetails] = useState<any>(null)
  const [channelVideos, setChannelVideos] = useState<YouTubeVideo[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<string>("")
  const [transcript, setTranscript] = useState<string | null>(null)
  const [transcriptError, setTranscriptError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("info")
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({
    comments: false,
    channelDetails: false,
    channelVideos: false,
    aiAnalysis: false,
    transcript: false
  })
  const [commentSentiment, setCommentSentiment] = useState<any>(null)
  const [performanceRate, setPerformanceRate] = useState<number>(0)
  const [contributionRate, setContributionRate] = useState<number>(0)
  const [growthData, setGrowthData] = useState<any[]>([])
  const [recentGrowthRate, setRecentGrowthRate] = useState<number>(0)
  const [overallGrowthRate, setOverallGrowthRate] = useState<number>(0)

  useEffect(() => {
    if (video) {
      fetchComments()
      fetchChannelDetails()
      fetchCommentSentiment()
    }
  }, [video])

  useEffect(() => {
    if (video && channelDetails) {
      // 성과도 계산
      const performance = calculatePerformance(
        Number(video.statistics?.viewCount || 0),
        Number(channelDetails.statistics?.subscriberCount || 0)
      )
      setPerformanceRate(performance)

      // 기여도 계산
      const averageViews = Number(channelDetails.statistics?.viewCount || 0) / 
        Number(channelDetails.statistics?.videoCount || 1)
      const contribution = calculateContribution(video, averageViews)
      setContributionRate(contribution)
    }
  }, [video, channelDetails])

  // 성과도와 기여도를 문자열로 변환
  const performanceRateStr = `${performanceRate.toFixed(1)}%`
  const contributionRateStr = `${contributionRate.toFixed(1)}%`

  // 비디오 ID 체크
  if (!video?.id || (isVideoId(video.id) && !video.id.videoId)) {
    return null;
  }

  // 댓글 가져오기
  const fetchComments = async () => {
    try {
      const result = await getVideoComments(getVideoId(video.id))
      if (result.items?.length) {
        setComments(result.items)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  // 채널 정보 가져오기
  const fetchChannelDetails = async () => {
    try {
      const result = await getChannelDetails(video.snippet.channelId)
      if (result.items?.[0]) {
        setChannelDetails(result.items[0])
      }
    } catch (error) {
      console.error('Error fetching channel details:', error)
    }
  }

  // 댓글 감정분석 가져오기
  const fetchCommentSentiment = async () => {
    if (!video?.id) return;
    
    try {
      const videoId = getVideoId(video.id);
      const result = await analyzeCommentSentiment(videoId);
      if (!result.error && result.data) {
        setCommentSentiment(result.data);
      }
    } catch (error) {
      console.error('Error analyzing comments:', error);
    }
  };
  // AI 분석 처리
  const handleAiAnalysis = async () => {
    setLoading(prev => ({ ...prev, transcript: true, aiAnalysis: true }));
    try {
      const transcriptResult = await extractTranscript(getVideoId(video?.id || ''));
      
      if (transcriptResult.error) {
        setTranscriptError(transcriptResult.error);
        return;
      }
      
      setTranscript(transcriptResult.transcript);
      
      // 2. AI 분석 자동 시작
      const result = await analyzeVideo(getVideoId(video?.id || ''));
      
      if (!result.error) {
        setAiAnalysis(result.analysis);
      }
    } catch (error) {
      console.error('Error in AI analysis:', error);
      setTranscriptError('스크립트 추출 중 오류가 발생했습니다.');
    } finally {
      setLoading(prev => ({ ...prev, transcript: false, aiAnalysis: false }));
    }
  };

  const handleLoadChannelVideos = async () => {
    if (!video?.snippet.channelId) return;
    
    setLoading(prev => ({ ...prev, channelVideos: true }));
    try {
      // 채널 동영상 가져오기
      const videos = await getChannelVideos(video.snippet.channelId);
      
      if (videos.length === 0) {
        toast({
          title: "동영상을 가져올 수 없습니다",
          description: "채널의 동영상 목록을 가져오는데 실패했습니다.",
          variant: "destructive"
        });
        return;
      }
      
      setChannelVideos(videos);
    } catch (error) {
      console.error('Error loading channel videos:', error);
      toast({
        title: "오류가 발생했습니다",
        description: "채널 동영상을 불러오는 중 문제가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, channelVideos: false }));
    }
  };

  // 성장률 계산 함수 추가
  const calculateGrowthRates = (viewHistory: number[]) => {
    if (viewHistory.length < 2) return { recent: 0, overall: 0 };

    // 전체 성장률 계산
    const firstValue = viewHistory[0];
    const lastValue = viewHistory[viewHistory.length - 1];
    const overall = ((lastValue - firstValue) / firstValue) * 100;

    // 최근 성장률 계산 (최근 7일)
    const recentPeriod = Math.min(7, viewHistory.length);
    const recentStart = viewHistory[viewHistory.length - recentPeriod];
    const recent = ((lastValue - recentStart) / recentStart) * 100;

    return { recent, overall };
  };

  useEffect(() => {
    if (video?.statistics?.viewCount) {
      // 가상의 히스토리 데이터 생성 (실제로는 API에서 받아와야 함)
      const viewCount = Number(video.statistics.viewCount);
      const historicalData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const randomGrowth = 0.97 + Math.random() * 0.06; // -3% to +3% 변동
        const views = Math.round(viewCount * (0.7 + (i * 0.3 / 29)) * randomGrowth);
        return {
          date: date.toISOString().split('T')[0],
          views: views
        };
      });

      setGrowthData(historicalData);
      
      // 성장률 계산
      const viewHistory = historicalData.map(d => d.views);
      const { recent, overall } = calculateGrowthRates(viewHistory);
      setRecentGrowthRate(recent);
      setOverallGrowthRate(overall);
    }
  }, [video]);
  // 스크립트 분석 결과 렌더링  
  const renderTranscriptContent = () => {
    if (loading.transcript) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    if (transcriptError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>스크립트를 가져올 수 없습니다</AlertTitle>
          <AlertDescription>
            <AnimatedText className="text-red-600 mb-4">
              {transcriptError.includes("자막이 비활성화") ? 
                "해당 영상은 소유자가 스크립트 공유를 원하지 않습니다." : 
                transcriptError}
            </AnimatedText>
            <p className="mt-4">가능한 해결 방법:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>다른 동영상으로 시도해보세요.</li>
              <li>영상 제작자에게 자막 추가를 요청해보세요.</li>
              <li>자동 생성 자막이 추가될 때까지 기다려보세요.</li>
            </ul>
          </AlertDescription>
        </Alert>
      );
    }
    // 스크립트 분석 결과 렌더링
    if (transcript) {
      return (
        <Card>
          <CardContent className="pt-4">
            <AnimatedText className="mb-4 text-primary">
              스크립트 분석 결과
            </AnimatedText>
            <p className="whitespace-pre-wrap">{transcript}</p>
          </CardContent>
        </Card>
      );
    }
    // AI 분석 버튼 렌더링
    return (
      <div className="text-center">
        <Button onClick={handleAiAnalysis} disabled={loading.aiAnalysis || loading.transcript}>
          {loading.aiAnalysis || loading.transcript ? "분석 중..." : "AI 분석 시작"}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          * 자막이 있는 영상에서만 스크립트를 추출할 수 있습니다.
        </p>
      </div>
    );
  };
  // 댓글 목록 렌더링
  return (
    <Sheet open={!!video} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
      <div className="p-4 sticky top-0 bg-background z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold">{video.snippet.title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
        </TabsList>

          {/* 정보 탭 */}
        <TabsContent value="info">
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4 space-y-4">
                {/* 임베디드 플레이어 */}
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                    src={`https://www.youtube.com/embed/${getVideoId(video.id)}`}
                  allowFullScreen
                />
              </div>

                {/* 성과 지표 */}
                <Card>
                  <CardHeader>
                    <CardTitle>성과 지표</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">평균 조회수</p>
                        <p className="text-2xl font-bold">
                          {formatNumber(Number(video.statistics?.viewCount || 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">총 조회수</p>
                        <p className="text-2xl font-bold">
                          {formatNumber(Number(video.statistics?.viewCount || 0))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">참여율</p>
                        <p className="text-2xl font-bold">
                          {((Number(video.statistics?.likeCount || 0) + Number(video.statistics?.commentCount || 0)) / 
                            Number(video.statistics?.viewCount || 1) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">구독자 성장</p>
                        <p className="text-2xl font-bold">
                          {channelDetails?.subscriberGrowth || "로딩 중..."}
                        </p>
                        <Badge variant="secondary" className="mt-1">최근 3개월</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 댓글 목록 */}
                <Card>
                  <CardHeader>
                    <CardTitle>댓글</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {comments.length > 0 ? (
                      <div className="space-y-4">
              {comments.map((thread) => (
                          <div key={thread.id} className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <img
                                src={thread.snippet.topLevelComment.snippet.authorProfileImageUrl}
                        alt={thread.snippet.topLevelComment.snippet.authorDisplayName}
                        className="w-10 h-10 rounded-full"
                      />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium">
                                    {thread.snippet.topLevelComment.snippet.authorDisplayName}
                                  </p>
                        <p className="text-sm text-muted-foreground">
                                    {formatDate(thread.snippet.topLevelComment.snippet.publishedAt)}
                                  </p>
                                </div>
                                <p>{thread.snippet.topLevelComment.snippet.textDisplay}</p>
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <span>좋아요 {formatNumber(thread.snippet.topLevelComment.snippet.likeCount)}</span>
                                  {thread.snippet.totalReplyCount > 0 && (
                                    <span>• 답글 {formatNumber(thread.snippet.totalReplyCount)}</span>
                                  )}
                                </div>
                      </div>
                    </div>
                    {thread.replies && (
                              <div className="ml-14 space-y-4">
                        {thread.replies.comments.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-4">
                            <img
                                      src={reply.snippet.authorProfileImageUrl}
                              alt={reply.snippet.authorDisplayName}
                              className="w-8 h-8 rounded-full"
                            />
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <p className="font-medium">{reply.snippet.authorDisplayName}</p>
                              <p className="text-sm text-muted-foreground">
                                          {formatDate(reply.snippet.publishedAt)}
                              </p>
                                      </div>
                                      <p>{reply.snippet.textDisplay}</p>
                                      <p className="text-sm text-muted-foreground">
                                좋아요 {formatNumber(reply.snippet.likeCount)}
                              </p>
                            </div>
                          </div>
                        ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        댓글이 없습니다.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 댓글 감정분석 */}
                {commentSentiment && (
                  <Card>
                    <CardHeader>
                      <CardTitle>댓글 감정분석</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">긍정적</p>
                          <p className="text-2xl font-bold text-green-500">
                            {formatNumber(commentSentiment.summary.positive)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">중립적</p>
                          <p className="text-2xl font-bold text-yellow-500">
                            {formatNumber(commentSentiment.summary.neutral)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">부정적</p>
                          <p className="text-2xl font-bold text-red-500">
                            {formatNumber(commentSentiment.summary.negative)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">평균 감정 점수</p>
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div
                            className="bg-primary rounded-full h-2.5"
                            style={{ width: `${((commentSentiment.summary.averageScore + 1) / 2) * 100}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
            </div>
          </ScrollArea>
        </TabsContent>

          {/* 성과 분석 탭 */}
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <AnimatedText className="mb-4 text-primary">
                  성과 지표
                </AnimatedText>
                <div className="grid gap-6">
                  {/* 영향력 지수 섹션 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">영향력 지수</p>
                        <div className="flex items-center gap-2">
                          <HoverCard>
                            <HoverCardTrigger>
                              <Badge 
                                variant={getPerformanceGrade(performanceRate).color}
                                className="text-lg px-3 py-1 cursor-help"
                              >
                                {getPerformanceGrade(performanceRate).grade}
                              </Badge>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <div className="space-y-2">
                                <p className="text-sm font-medium">{getPerformanceGrade(performanceRate).description}</p>
                                <p className="text-xs text-muted-foreground">
                                  구독자 대비 시청자 참여도를 분석한 영향력 지표입니다.
                                </p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <p className="text-2xl font-bold">{performanceRate.toFixed(1)}%</p>
                        </div>
                      </div>
                      <Progress 
                        value={performanceRate} 
                        className={`w-1/3 ${
                          getPerformanceGrade(performanceRate).color === 'secondary' ? 'bg-blue-500' :
                          getPerformanceGrade(performanceRate).color === 'destructive' ? 'bg-red-500' :
                          'bg-green-500'
                        }`}
                      />
                    </div>
                    <CardDescription>
                      이 동영상은 {getPerformanceGrade(performanceRate).description}을 보여주고 있습니다.
                    </CardDescription>
                  </div>

                  {/* 성장 기여도 섹션 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">성장 기여도</p>
                        <div className="flex items-center gap-2">
                          <HoverCard>
                            <HoverCardTrigger>
                              <Badge 
                                variant={getContributionGrade(contributionRate).color}
                                className="text-lg px-3 py-1 cursor-help"
                              >
                                {getContributionGrade(contributionRate).grade}
                              </Badge>
                            </HoverCardTrigger>
                            <HoverCardContent>
                              <div className="space-y-2">
                                <p className="text-sm font-medium">{getContributionGrade(contributionRate).description}</p>
                                <p className="text-xs text-muted-foreground">
                                  채널의 평균 성과 대비 이 동영상의 성장 기여도를 나타냅니다.
                                </p>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <p className="text-2xl font-bold">{contributionRate.toFixed(1)}%</p>
                        </div>
                      </div>
                      <Progress 
                        value={contributionRate} 
                        className={`w-1/3 ${
                          getContributionGrade(contributionRate).color === 'secondary' ? 'bg-blue-500' :
                          getContributionGrade(contributionRate).color === 'destructive' ? 'bg-red-500' :
                          'bg-green-500'
                        }`}
                      />
                    </div>
                    <CardDescription>
                      채널 성장에 {getContributionGrade(contributionRate).description}를 보입니다.
                    </CardDescription>
                  </div>

                  {/* 기본 통계 */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">조회수</p>
                      <p className="text-2xl font-bold">{formatNumber(Number(video.statistics?.viewCount || 0))}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">좋아요</p>
                      <p className="text-2xl font-bold">{formatNumber(Number(video.statistics?.likeCount || 0))}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">댓글</p>
                      <p className="text-2xl font-bold">{formatNumber(Number(video.statistics?.commentCount || 0))}</p>
                    </div>
                  </div>

                  {/* 성장 추이 그래프 */}
                  <div className="mt-6 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => value.split('-').slice(1).join('/')}
                        />
                        <YAxis 
                          tickFormatter={(value) => formatNumber(value)}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatNumber(value), "조회수"]}
                          labelFormatter={(label) => `${label.split('-').slice(1).join('/')}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="views" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            <VideoPerformanceChart video={video} />
          </TabsContent>

          {/* AI 분석 탭 */}
          <TabsContent value="ai">
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4 space-y-4">
                {/* 동영상 성과 지표 */}
                <VideoPerformanceChart video={video} />

                {/* 썸네일 효과 분석 */}
                <ThumbnailAnalysis video={video} />

                {/* 태그 분석 */}
                <TagAnalysis video={video} />

                {/* 스크립트 추출 및 AI 분석 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>스크립트 분석</span>
                      {!transcript && (
                        <Button 
                          onClick={handleAiAnalysis} 
                          disabled={loading.aiAnalysis || loading.transcript}
                        >
                          {loading.aiAnalysis || loading.transcript ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              분석 중...
                            </>
                          ) : (
                            '스크립트 분석 시작'
                          )}
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transcriptError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>스크립트를 가져올 수 없습니다</AlertTitle>
                        <AlertDescription>{transcriptError}</AlertDescription>
                      </Alert>
                    ) : transcript ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2">AI 분석 결과</h3>
                          <div className="prose prose-sm dark:prose-invert">
                            {aiAnalysis || (
                              <div className="flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>분석 중...</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Separator />
                        <div>
                          <h3 className="font-medium mb-2">추출된 스크립트</h3>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{transcript}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        스크립트 분석을 시작하려면 버튼을 클릭하세요.
                      </p>
                    )}
                  </CardContent>
                </Card>
            </div>
          </ScrollArea>
        </TabsContent>

          {/* 퍼널 신경망 탭 */}
          <TabsContent value="funnel">
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>퍼널 신경망 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {channelVideos.length > 0 ? (
                      <NeuralNetworkGraph video={video} relatedVideos={channelVideos} />
                    ) : (
                      <div className="text-center py-4">
                        <Button 
                          onClick={handleLoadChannelVideos} 
                          disabled={loading.channelVideos}
                        >
                          {loading.channelVideos ? "데이터 로딩 중..." : "신경망 분석 시작"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>관련 동영상 정보</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {channelVideos.slice(0, 5).map((relatedVideo) => (
                        <div key={typeof relatedVideo.id === 'string' ? relatedVideo.id : getVideoId(relatedVideo.id)} className="flex items-start space-x-4">
                          <div className="relative w-32 aspect-video rounded-lg overflow-hidden">
                            <img
                              src={relatedVideo.snippet.thumbnails.medium.url}
                              alt={relatedVideo.snippet.title}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium line-clamp-2">{relatedVideo.snippet.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(relatedVideo.snippet.publishedAt)}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm">
                                조회수 {formatNumber(Number(relatedVideo.statistics?.viewCount || 0))}회
                              </span>
                              <span>•</span>
                              <span className="text-sm">
                                좋아요 {formatNumber(Number(relatedVideo.statistics?.likeCount || 0))}개
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* 채널 탭 */}
          <TabsContent value="channel">
            <ScrollArea className="h-[calc(100vh-120px)]">
              <div className="p-4 space-y-4">
                {channelDetails ? (
                  <>
                    {/* 채널 기본 정보 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>채널 정보</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                          {channelDetails.snippet.thumbnails.default && (
                            <img
                              src={channelDetails.snippet.thumbnails.default.url}
                              alt={channelDetails.snippet.title}
                              className="w-16 h-16 rounded-full"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{channelDetails.snippet.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {channelDetails.snippet.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                구독자 {formatNumber(Number(channelDetails.statistics.subscriberCount))}명
                              </Badge>
                              <Badge variant="secondary">
                                총 동영상 {formatNumber(Number(channelDetails.statistics.videoCount))}개
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 채널 성과 지표 */}
                    <Card>
                      <CardHeader>
                        <CardTitle>채널 성과</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">평균 조회수</p>
                            <p className="text-2xl font-bold">
                              {formatNumber(Math.round(
                                Number(channelDetails.statistics.viewCount) / 
                                Number(channelDetails.statistics.videoCount)
                              ))}
                            </p>
                            <Badge variant="secondary" className="mt-1">동영상당</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">총 조회수</p>
                            <p className="text-2xl font-bold">
                              {formatNumber(Number(channelDetails.statistics.viewCount))}
                            </p>
                            <Badge variant="secondary" className="mt-1">누적</Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">참여율</p>
                            <p className="text-2xl font-bold">
                              {((Number(channelDetails.statistics.viewCount) / 
                                Number(channelDetails.statistics.subscriberCount)) * 100).toFixed(1)}%
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">구독자</p>
                            <p className="text-2xl font-bold">
                              {formatNumber(Number(channelDetails.statistics.subscriberCount))}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 채널 동영상 목록 */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>최근 업로드</span>
                          <Button 
                            onClick={handleLoadChannelVideos} 
                            disabled={loading.channelVideos}
                            variant="outline"
                            size="sm"
                          >
                            {loading.channelVideos ? "로딩 중..." : "새로고침"}
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {channelVideos && channelVideos.length > 0 ? (
                          <ChannelVideosTable videos={channelVideos} />
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            {loading.channelVideos ? "동영상을 불러오는 중..." : "동영상이 없습니다."}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Button onClick={fetchChannelDetails} disabled={loading.channelDetails}>
                    {loading.channelDetails ? "채널 정보 로딩 중..." : "채널 정보 불러오기"}
                </Button>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      </SheetContent>
    </Sheet>
  )
}
