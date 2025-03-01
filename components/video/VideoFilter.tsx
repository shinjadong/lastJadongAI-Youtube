"use client"

import { useState, useEffect } from "react"
import { 
  Filter, 
  Calendar, 
  Eye, 
  Users, 
  ThumbsUp, 
  BarChart2,
  Video,
  RefreshCw,
  Zap,
  TrendingUp
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { DatePicker } from "@/components/ui/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatNumber } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface VideoFilterValues {
  viewsRange: [number, number];
  subscribersRange: [number, number];
  publishDateRange: { from: Date | null; to: Date | null };
  hookIndex: string[];
  growthIndex: string[];
  videoType: string[];
}

interface VideoFilterProps {
  onFilterChange: (filters: VideoFilterValues) => void;
}

const MAX_VIEWS = 1000000;
const MAX_SUBSCRIBERS = 1000000;

export function VideoFilter({ onFilterChange }: VideoFilterProps) {
  const [filters, setFilters] = useState<VideoFilterValues>({
    viewsRange: [0, MAX_VIEWS],
    subscribersRange: [0, MAX_SUBSCRIBERS],
    publishDateRange: { from: null, to: null },
    hookIndex: ["Good", "Normal", "Bad", "Worst"],
    growthIndex: ["Good", "Normal", "Bad", "Worst"],
    videoType: ["shorts", "longform"]
  });

  // 비디오 타입 체크박스 상태 관리
  const [shortsChecked, setShortsChecked] = useState(true);
  const [longformChecked, setLongformChecked] = useState(true);

  // 초기화 시 체크박스 상태 설정
  useEffect(() => {
    setShortsChecked(filters.videoType.includes("shorts"));
    setLongformChecked(filters.videoType.includes("longform"));
  }, [filters.videoType]);

  const handleViewsChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, viewsRange: [value[0], value[1]] }));
  };

  const handleSubscribersChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, subscribersRange: [value[0], value[1]] }));
  };

  const handleFromDateChange = (date: Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      publishDateRange: { ...prev.publishDateRange, from: date || null }
    }));
  };

  const handleToDateChange = (date: Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      publishDateRange: { ...prev.publishDateRange, to: date || null }
    }));
  };

  const handleHookIndexChange = (value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      hookIndex: checked
        ? [...prev.hookIndex, value]
        : prev.hookIndex.filter(item => item !== value)
    }));
  };

  const handleGrowthIndexChange = (value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      growthIndex: checked
        ? [...prev.growthIndex, value]
        : prev.growthIndex.filter(item => item !== value)
    }));
  };

  const handleVideoTypeChange = (value: string, checked: boolean) => {
    // 체크박스 상태 업데이트
    if (value === "shorts") {
      setShortsChecked(checked);
    } else if (value === "longform") {
      setLongformChecked(checked);
    }

    // 필터 상태 업데이트
    setFilters(prev => {
      // 현재 필터 상태 복사
      const newVideoType = [...prev.videoType];
      
      if (checked) {
        // 이미 포함되어 있지 않은 경우에만 추가
        if (!newVideoType.includes(value)) {
          newVideoType.push(value);
        }
      } else {
        // 제거
        const filteredTypes = newVideoType.filter(type => type !== value);
        
        // 모든 타입이 선택 해제되면 변경하지 않음 (최소 하나는 선택되어야 함)
        if (filteredTypes.length === 0) {
          // 모든 타입이 선택 해제되면 다른 타입을 자동으로 선택
          if (value === "shorts") {
            setLongformChecked(true);
            return {
              ...prev,
              videoType: ["longform"]
            };
          } else {
            setShortsChecked(true);
            return {
              ...prev,
              videoType: ["shorts"]
            };
          }
        }
        
        return {
          ...prev,
          videoType: filteredTypes
        };
      }
      
      return {
        ...prev,
        videoType: newVideoType
      };
    });
  };

  const handleDatePreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    
    setFilters(prev => ({
      ...prev,
      publishDateRange: { from, to }
    }));
  };

  const handleResetFilters = () => {
    const resetFilters: VideoFilterValues = {
      viewsRange: [0, MAX_VIEWS],
      subscribersRange: [0, MAX_SUBSCRIBERS],
      publishDateRange: { from: null, to: null },
      hookIndex: ["Good", "Normal", "Bad", "Worst"],
      growthIndex: ["Good", "Normal", "Bad", "Worst"],
      videoType: ["shorts", "longform"]
    };
    
    setFilters(resetFilters);
    setShortsChecked(true);
    setLongformChecked(true);
  };

  const handleApplyFilters = () => {
    // 비디오 타입 필터 확인 및 수정
    let updatedFilters = { ...filters };
    
    // 비디오 타입 필터 확인
    const videoTypeFilter = [];
    if (shortsChecked) videoTypeFilter.push("shorts");
    if (longformChecked) videoTypeFilter.push("longform");
    
    // 비디오 타입 필터가 비어있으면 모든 타입 선택
    if (videoTypeFilter.length === 0) {
      videoTypeFilter.push("shorts", "longform");
      setShortsChecked(true);
      setLongformChecked(true);
    }
    
    updatedFilters.videoType = videoTypeFilter;
    
    // 필터 적용
    onFilterChange(updatedFilters);
    
    // 상태 업데이트
    setFilters(updatedFilters);
  };

  const getHookIndexColor = (grade: string) => {
    switch (grade) {
      case "Good": return "bg-green-500";
      case "Normal": return "bg-blue-500";
      case "Bad": return "bg-yellow-500";
      case "Worst": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getGrowthIndexColor = (grade: string) => {
    switch (grade) {
      case "Good": return "bg-green-500";
      case "Normal": return "bg-blue-500";
      case "Bad": return "bg-yellow-500";
      case "Worst": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getHookIndexDescription = (grade: string) => {
    switch (grade) {
      case "Good": return "좋음";
      case "Normal": return "보통";
      case "Bad": return "나쁨";
      case "Worst": return "최악";
      default: return "";
    }
  };

  const getGrowthIndexDescription = (grade: string) => {
    switch (grade) {
      case "Good": return "좋음";
      case "Normal": return "보통";
      case "Bad": return "나쁨";
      case "Worst": return "최악";
      default: return "";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            필터 옵션
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleResetFilters}
            className="h-8 px-2 text-xs"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            초기화
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="metrics">지표</TabsTrigger>
            <TabsTrigger value="date">날짜</TabsTrigger>
            <TabsTrigger value="type">유형</TabsTrigger>
          </TabsList>
          
          <TabsContent value="metrics" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                    조회수 범위
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(filters.viewsRange[0])} - {formatNumber(filters.viewsRange[1])}
                  </span>
                </div>
                <Slider
                  defaultValue={[0, MAX_VIEWS]}
                  min={0}
                  max={MAX_VIEWS}
                  step={10000}
                  value={filters.viewsRange}
                  onValueChange={handleViewsChange}
                  className="py-4"
                />
                <div className="mt-1 mb-4">
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-gray-300 flex items-center justify-center text-[9px] text-gray-700" style={{ width: '10%' }}>
                      0
                    </div>
                    <div className="h-full bg-gray-200 flex items-center justify-center text-[9px] text-gray-700" style={{ width: '15%' }}>
                      10만
                    </div>
                    <div className="h-full bg-gray-300 flex items-center justify-center text-[9px] text-gray-700" style={{ width: '15%' }}>
                      25만
                    </div>
                    <div className="h-full bg-gray-200 flex items-center justify-center text-[9px] text-gray-700" style={{ width: '20%' }}>
                      50만
                    </div>
                    <div className="h-full bg-gray-300 flex items-center justify-center text-[9px] text-gray-700" style={{ width: '40%' }}>
                      100만+
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                    <span>적음</span>
                    <span>많음</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    구독자 범위
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {formatNumber(filters.subscribersRange[0])} - {formatNumber(filters.subscribersRange[1])}
                  </span>
                </div>
                <Slider
                  defaultValue={[0, MAX_SUBSCRIBERS]}
                  min={0}
                  max={MAX_SUBSCRIBERS}
                  step={10000}
                  value={filters.subscribersRange}
                  onValueChange={handleSubscribersChange}
                  className="py-4"
                />
                <div className="mt-1 mb-4">
                  <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-gray-300 flex items-center justify-center text-[9px] text-gray-700" style={{ width: '20%' }}>
                      0
                    </div>
                    <div className="h-full bg-gray-200 flex items-center justify-center text-[9px] text-gray-700" style={{ width: '20%' }}>
                      10만
                    </div>
                    <div className="h-full bg-gray-300 flex items-center justify-center text-[9px] text-gray-700" style={{ width: '20%' }}>
                      30만
                    </div>
                    <div className="h-full bg-gray-200 flex items-center justify-center text-[9px] text-gray-700" style={{ width: '20%' }}>
                      50만
                    </div>
                    <div className="h-full bg-gray-300 flex items-center justify-center text-[9px] text-gray-700" style={{ width: '20%' }}>
                      100만+
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500 mt-1">
                    <span>적음</span>
                    <span>많음</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="date" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <DatePicker
                date={filters.publishDateRange.from || undefined}
                setDate={handleFromDateChange}
                label="시작일"
              />
              <DatePicker
                date={filters.publishDateRange.to || undefined}
                setDate={handleToDateChange}
                label="종료일"
              />
            </div>
            
            <div className="mt-4">
              <Label className="text-sm font-medium mb-2 block">간편 선택</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDatePreset(7)}
                  className="h-8"
                >
                  1주일
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDatePreset(30)}
                  className="h-8"
                >
                  1개월
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDatePreset(90)}
                  className="h-8"
                >
                  3개월
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDatePreset(180)}
                  className="h-8"
                >
                  6개월
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDatePreset(365)}
                  className="h-8"
                >
                  12개월
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    publishDateRange: { from: null, to: null }
                  }))}
                  className="h-8"
                >
                  전체
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="type" className="space-y-6 pt-4">
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center">
                <Zap className="mr-2 h-4 w-4 text-muted-foreground" />
                후킹지수
              </Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {["Good", "Normal", "Bad", "Worst"].map(grade => (
                  <div key={`hook-${grade}`} className="flex flex-col items-center space-y-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`hook-${grade}`} 
                        checked={filters.hookIndex.includes(grade)}
                        onCheckedChange={(checked) => 
                          handleHookIndexChange(grade, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`hook-${grade}`}
                        className="text-sm font-medium"
                      >
                        {getHookIndexDescription(grade)}
                      </Label>
                    </div>
                    <Badge variant="secondary" className={`text-white ${getHookIndexColor(grade)}`}>
                      {grade}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                성장지수
              </Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {["Good", "Normal", "Bad", "Worst"].map(grade => (
                  <div key={`growth-${grade}`} className="flex flex-col items-center space-y-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id={`growth-${grade}`} 
                        checked={filters.growthIndex.includes(grade)}
                        onCheckedChange={(checked) => 
                          handleGrowthIndexChange(grade, checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`growth-${grade}`}
                        className="text-sm font-medium"
                      >
                        {getGrowthIndexDescription(grade)}
                      </Label>
                    </div>
                    <Badge variant="secondary" className={`text-white ${getGrowthIndexColor(grade)}`}>
                      {grade}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center">
                <Video className="mr-2 h-4 w-4 text-muted-foreground" />
                영상 타입
              </Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                      id="video-shorts" 
                      checked={shortsChecked}
                      onCheckedChange={(checked) => 
                        handleVideoTypeChange("shorts", checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor="video-shorts"
                      className="text-sm font-medium"
                    >
                      숏폼
                    </Label>
                  </div>
                  <Badge variant="outline" className="bg-red-500 text-white">
                    60초 이하
                  </Badge>
                </div>
                <div className="flex flex-col items-center p-3 border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                      id="video-longform" 
                      checked={longformChecked}
                      onCheckedChange={(checked) => 
                        handleVideoTypeChange("longform", checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor="video-longform"
                      className="text-sm font-medium"
                    >
                      롱폼
                    </Label>
                  </div>
                  <Badge variant="outline" className="bg-blue-500 text-white">
                    60초 초과
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Button 
          className="w-full"
          onClick={handleApplyFilters}
        >
          필터 적용
        </Button>
      </CardContent>
    </Card>
  )
} 