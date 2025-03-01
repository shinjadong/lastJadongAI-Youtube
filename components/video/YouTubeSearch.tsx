"use client"

import { useState, useEffect, useCallback } from "react"
import { useInView } from "react-intersection-observer"

// 타입 임포트
import type { YouTubeVideo, SearchResult, ChannelDetails, VideoFormat } from "@/types/youtube"

// 액션 임포트
import {
  searchVideos,
  getChannelDetails,
  calculatePerformance,
  calculateContribution,
  calculateChannelAverageViews,
} from "@/app/actions/youtube"

// 유틸리티 임포트
import { formatNumber, formatDate, isLongForm, isShortForm, getVideoId } from "@/lib/utils"

// UI 컴포넌트 임포트
import { 
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  useToast
} from "@/components/ui"

// 아이콘 임포트
import { 
  LayoutGrid, 
  LayoutList, 
  Search, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  ChevronUp, 
  ChevronDown, 
  Calendar,
  SortAsc,
  SortDesc,
  Star,
  TrendingUp,
  Timer
} from "lucide-react"

// 로컬 컴포넌트 임포트
import VideoSidebar from "./VideoSidebar"
import TagCloud from "./TagCloud"
import RelatedVideoNetwork from "./RelatedVideoNetwork"
import ThumbnailEffectAnalysis from "./ThumbnailEffectAnalysis"
import VideoModal from "./video-modal"

type ViewMode = "grid" | "list"
type SortField = "views" | "date" | "performance" | "contribution"
type SortDirection = "asc" | "desc"

interface SearchState {
  videos: YouTubeVideo[]
  nextPageToken: string | null
  error: string | null
}

interface ChannelDetailsState {
  [key: string]: ChannelDetails | undefined
}

export default function YouTubeSearch() {
  const [keyword, setKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchState, setSearchState] = useState<SearchState>({
    videos: [],
    nextPageToken: null,
    error: null
  })
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [sortField, setSortField] = useState<SortField>("views")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [channelDetails, setChannelDetails] = useState<ChannelDetailsState>({})
  const [videoFormat, setVideoFormat] = useState<VideoFormat>("all")
  const [filters, setFilters] = useState({
    minViews: 0,
    maxViews: Number.POSITIVE_INFINITY,
    minLikes: 0,
    maxLikes: Number.POSITIVE_INFINITY,
    fromDate: "",
    toDate: new Date().toISOString().split('T')[0]
  })

  // 채널 정보 가져오기 함수
  const fetchChannelDetails = useCallback(async (videos: YouTubeVideo[]) => {
    const uniqueChannelIds = Array.from(new Set(
      videos.map(video => video.snippet.channelId)
    ))

    const newChannelDetails: ChannelDetailsState = { ...channelDetails }
    
    await Promise.all(
      uniqueChannelIds.map(async (channelId) => {
        if (!newChannelDetails[channelId]) {
          const result = await getChannelDetails(channelId)
          if (result.data?.items?.[0]) {
            newChannelDetails[channelId] = result.data.items[0]
          }
        }
      })
    )

    setChannelDetails(newChannelDetails)
  }, [channelDetails])

  // 검색 처리 함수
  const handleSearch = useCallback(async (pageToken?: string | null | undefined) => {
    if (!keyword.trim()) return

    setLoading(true)
    try {
      console.log('Searching with keyword:', keyword, 'pageToken:', pageToken)
      const result = await searchVideos(keyword, pageToken || undefined)
      console.log('Search result:', result)
      
      if (!result.items) {
        console.log('No data in result')
        return
      }
      
      const newVideos = result.items.map(item => ({
        kind: "youtube#video" as const,
        etag: item.etag,
        id: typeof item.id === 'string' ? { kind: "youtube#video", videoId: item.id } : item.id,
        snippet: item.snippet,
        contentDetails: item.contentDetails,
        statistics: item.statistics
      } as YouTubeVideo))

      console.log('Processed videos:', newVideos)

      setSearchState(prev => ({
        videos: pageToken ? [...prev.videos, ...newVideos] : newVideos,
        nextPageToken: result.nextPageToken || null,
        error: null
      }))
      fetchChannelDetails(newVideos)
    } catch (error) {
      console.error('Search error:', error)
      setSearchState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "검색 중 오류가 발생했습니다"
      }))
    } finally {
      setLoading(false)
    }
  }, [keyword, fetchChannelDetails])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleRetry = () => {
    setSearchState(prev => ({ ...prev, error: null }))
    const mockEvent = new Event("submit", {
      bubbles: true,
      cancelable: true,
    }) as unknown as React.FormEvent<Element>
    handleSearch()
  }

  const sortedVideos = [...searchState.videos].sort((a, b) => {
    const modifier = sortDirection === "asc" ? 1 : -1
    const channelA = channelDetails[a.snippet.channelId]
    const channelB = channelDetails[b.snippet.channelId]
    const avgViewsA = calculateChannelAverageViews(channelA?.statistics)
    const avgViewsB = calculateChannelAverageViews(channelB?.statistics)

    switch (sortField) {
      case "views":
        return (Number(a.statistics?.viewCount || 0) - Number(b.statistics?.viewCount || 0)) * modifier
      case "date":
        return (new Date(a.snippet.publishedAt).getTime() - new Date(b.snippet.publishedAt).getTime()) * modifier
      case "performance":
        return (
          (calculatePerformance(
            Number(a.statistics?.viewCount || 0),
            Number(channelA?.statistics?.subscriberCount || 1),
          ) -
            calculatePerformance(
              Number(b.statistics?.viewCount || 0),
              Number(channelB?.statistics?.subscriberCount || 1),
            )) *
          modifier
        )
      case "contribution":
        return (calculateContribution(a, avgViewsA) - calculateContribution(b, avgViewsB)) * modifier
      default:
        return 0
    }
  })

  const filteredVideos = sortedVideos.filter((video) => {
    const views = Number(video.statistics?.viewCount || 0)
    const likes = Number(video.statistics?.likeCount || 0)
    const publishedAt = new Date(video.snippet.publishedAt)

    return (
      views >= filters.minViews &&
      views <= (filters.maxViews || Number.POSITIVE_INFINITY) &&
      likes >= filters.minLikes &&
      likes <= (filters.maxLikes || Number.POSITIVE_INFINITY) &&
      (!filters.fromDate || publishedAt >= new Date(filters.fromDate)) &&
      (!filters.toDate || publishedAt <= new Date(filters.toDate))
    )
  })

  const filteredVideosByFormat = filteredVideos.filter(video => {
    if (!video.contentDetails?.duration) return true
    
    switch (videoFormat) {
      case 'short':
        return isShortForm(video.contentDetails.duration)
      case 'long':
        return isLongForm(video.contentDetails.duration)
      default:
        return true
    }
  })

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) => (prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]))
  }

  const handleVideoSelect = (video: YouTubeVideo) => {
    setSelectedVideo(video)
    setSidebarOpen(true)
  }

  const formatDuration = (duration?: string) => {
    if (!duration) return "00:00"

    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return "00:00"

    const hours = Number.parseInt(match[1]?.replace("H", "") || "0")
    const minutes = Number.parseInt(match[2]?.replace("M", "") || "0")
    const seconds = Number.parseInt(match[3]?.replace("S", "") || "0")

    const totalSeconds = hours * 3600 + minutes * 60 + seconds

    const formatNumber = (num: number) => num.toString().padStart(2, "0")

    if (totalSeconds >= 3600) {
      return `${formatNumber(Math.floor(totalSeconds / 3600))}:${formatNumber(Math.floor((totalSeconds % 3600) / 60))}:${formatNumber(totalSeconds % 60)}`
    } else {
      return `${formatNumber(Math.floor(totalSeconds / 60))}:${formatNumber(totalSeconds % 60)}`
    }
  }

  const handleLoadMore = useCallback(() => {
    if (searchState.nextPageToken) {
      handleSearch(searchState.nextPageToken)
    }
  }, [searchState.nextPageToken, handleSearch])

  const { ref: loadMoreRef, inView } = useInView()

  useEffect(() => {
    if (inView && searchState.nextPageToken) {
      handleLoadMore()
    }
  }, [inView, handleLoadMore])

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Form submitted with keyword:', keyword)
    if (!keyword.trim()) {
      console.log('Empty keyword, returning')
      return
    }
    handleSearch()
  }

  // 통계 변환 헬퍼 함수
  const getStatistics = (video: YouTubeVideo) => ({
    viewCount: String(video.statistics?.viewCount || 0),
    likeCount: String(video.statistics?.likeCount || 0),
    commentCount: String(video.statistics?.commentCount || 0)
  });

  // 비디오 ID를 문자열로 변환하는 함수
  const getVideoIdString = (video: YouTubeVideo): string => {
    return typeof video.id === 'string' ? video.id : getVideoId(video.id);
  };

  return (
    <div className="flex">
      <div className="flex-1 py-6">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="검색어를 입력하세요"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? "검색 중..." : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </form>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <Input
                type="number"
                placeholder="최소 조회수"
                onChange={(e) => setFilters({ ...filters, minViews: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="최대 조회수"
                onChange={(e) =>
                  setFilters({ ...filters, maxViews: Number(e.target.value) || Number.POSITIVE_INFINITY })
                }
              />
              <Input
                type="number"
                placeholder="최소 좋아요"
                onChange={(e) => setFilters({ ...filters, minLikes: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="최대 좋아요"
                onChange={(e) =>
                  setFilters({ ...filters, maxLikes: Number(e.target.value) || Number.POSITIVE_INFINITY })
                }
              />
              <Input
                type="date"
                placeholder="시작일"
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              />
              <Input
                type="date"
                placeholder="종료일"
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              />
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <Select value={videoFormat} onValueChange={(value: VideoFormat) => setVideoFormat(value)}>
                <SelectTrigger className="w-[120px]">
                  <Timer className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="영상 길이" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 보기</SelectItem>
                  <SelectItem value="short">숏폼</SelectItem>
                  <SelectItem value="long">롱폼</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortField} onValueChange={(value: SortField) => handleSort(value)}>
                <SelectTrigger className="w-[120px]">
                  {sortDirection === "desc" ? (
                    <SortDesc className="w-4 h-4 mr-2" />
                  ) : (
                    <SortAsc className="w-4 h-4 mr-2" />
                  )}
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="views">
                    <Eye className="w-4 h-4 mr-2 inline" />
                    조회수
                  </SelectItem>
                  <SelectItem value="date">
                    <Calendar className="w-4 h-4 mr-2 inline" />
                    날짜
                  </SelectItem>
                  <SelectItem value="performance">
                    <Star className="w-4 h-4 mr-2 inline" />
                    성과도
                  </SelectItem>
                  <SelectItem value="contribution">
                    <TrendingUp className="w-4 h-4 mr-2 inline" />
                    기여도
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {searchState.videos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>태그 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TagCloud videos={filteredVideosByFormat} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>관련 비디오 네트워크</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RelatedVideoNetwork videos={filteredVideosByFormat} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>썸네일 효과 분석</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ThumbnailEffectAnalysis videos={filteredVideosByFormat} />
                  </CardContent>
                </Card>
              </div>
            )}

            {searchState.error && (
              <div className="text-red-500 text-center p-4 bg-red-100 rounded-md mb-4">
                <p className="font-semibold">Error:</p>
                <p>{searchState.error}</p>
                {searchState.error.includes("API key") && <p className="mt-2">Please check your YouTube API key configuration.</p>}
                <Button onClick={handleRetry} className="mt-4">
                  Retry Search
                </Button>
              </div>
            )}

            {filteredVideosByFormat.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideosByFormat.map((video, index) => (
                  <Card
                    key={`${getVideoIdString(video)}-${index}`}
                    className="overflow-hidden cursor-pointer group"
                    onClick={() => handleVideoSelect(video)}
                  >
                    <div className="relative">
                      <img
                        src={video.snippet.thumbnails.medium.url || "/placeholder.svg"}
                        alt={video.snippet.title}
                        className="w-full aspect-video object-cover"
                      />
                      {video.contentDetails?.duration && (
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-xs text-white rounded">
                          {formatDuration(video.contentDetails.duration)}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary">
                        {video.snippet.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">{video.snippet.channelTitle}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {formatNumber(Number(video.statistics?.viewCount || 0))}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {formatNumber(Number(video.statistics?.likeCount || 0))}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {formatNumber(Number(video.statistics?.commentCount || 0))}
                        </span>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Badge variant="secondary">
                          성과도:{" "}
                          {calculatePerformance(
                            Number(video.statistics?.viewCount || 0),
                            Number(channelDetails[video.snippet.channelId]?.statistics?.subscriberCount || 1),
                          ).toFixed(2)}
                        </Badge>
                        <Badge variant="secondary">
                          기여도:{" "}
                          {calculateContribution(
                            {
                              statistics: getStatistics(video)
                            },
                            calculateChannelAverageViews(channelDetails[video.snippet.channelId]?.statistics)
                          ).toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {filteredVideosByFormat.length > 0 && viewMode === "list" && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead className="w-32 text-right cursor-pointer" onClick={() => handleSort("views")}>
                        <div className="flex items-center justify-end gap-2">
                          조회수
                          {sortField === "views" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead className="w-40">채널</TableHead>
                      <TableHead className="w-32 text-right cursor-pointer" onClick={() => handleSort("performance")}>
                        <div className="flex items-center justify-end gap-2">
                          성과도
                          {sortField === "performance" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead className="w-32 text-right cursor-pointer" onClick={() => handleSort("contribution")}>
                        <div className="flex items-center justify-end gap-2">
                          기여도
                          {sortField === "contribution" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead className="w-32 text-right cursor-pointer" onClick={() => handleSort("date")}>
                        <div className="flex items-center justify-end gap-2">
                          게시일
                          {sortField === "date" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVideosByFormat.map((video, index) => (
                      <TableRow
                        key={`${getVideoIdString(video)}-${index}`}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleVideoSelect(video)}
                      >
                        <TableCell className="w-12">
                          <Checkbox
                            checked={selectedVideos.includes(getVideoIdString(video))}
                            onCheckedChange={() => toggleVideoSelection(getVideoIdString(video))}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-4">
                            <div className="relative flex-shrink-0">
                              <img
                                src={video.snippet.thumbnails.medium.url || "/placeholder.svg"}
                                alt={video.snippet.title}
                                className="w-40 aspect-video object-cover rounded-md"
                              />
                              {video.contentDetails?.duration && (
                                <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-xs text-white rounded">
                                  {formatDuration(video.contentDetails.duration)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium line-clamp-2">{video.snippet.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                                {video.snippet.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(Number(video.statistics?.viewCount || 0))}
                        </TableCell>
                        <TableCell>{video.snippet.channelTitle}</TableCell>
                        <TableCell className="text-right">
                          {calculatePerformance(
                            Number(video.statistics?.viewCount || 0),
                            Number(channelDetails[video.snippet.channelId]?.statistics?.subscriberCount || 1),
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {calculateContribution(
                            {
                              statistics: getStatistics(video)
                            },
                            calculateChannelAverageViews(channelDetails[video.snippet.channelId]?.statistics)
                          ).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">{formatDate(video.snippet.publishedAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {filteredVideosByFormat.length === 0 && !loading && !searchState.error && (
              <div className="text-center text-muted-foreground">검색 결과가 여기에 표시됩니다.</div>
            )}
            {searchState.nextPageToken && filteredVideosByFormat.length > 0 && (
              <div ref={loadMoreRef} className="py-4 text-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={loading || !searchState.nextPageToken}
                >
                  {loading ? "로딩 중..." : "더 보기"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {sidebarOpen && <VideoSidebar video={selectedVideo} onClose={() => setSidebarOpen(false)} />}
    </div>
  )
}
