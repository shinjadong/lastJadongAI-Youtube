"use client"

// 타입 임포트
import type { YouTubeVideo } from "@/types/youtube"

// UI 컴포넌트 임포트
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardDescription, 
  CardFooter 
} from "../../../../../components/ui/card"
import { Badge } from "../../../../../components/ui/badge"
import { Button } from "../../../../../components/ui/button"
import { Progress } from "../../../../../components/ui/progress"
import { Input } from "../../../../../components/ui/input"
import { Label } from "../../../../../components/ui/label"
import { Separator } from "../../../../../components/ui/separator"
import { 
  HoverCard, 
  HoverCardTrigger, 
  HoverCardContent 
} from "../../../../../components/ui/hover-card"
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "../../../../../components/ui/alert"
import { ScrollArea } from "../../../../../components/ui/scroll-area"

// 아이콘 임포트
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Target, 
  MousePointerClick, 
  Timer,
  Loader2,
  AlertCircle
} from "lucide-react"

// 유틸리티 임포트
import { 
  formatNumber, 
  formatDate, 
  parseDuration,
  getPerformanceGrade, 
  getContributionGrade 
} from "@/lib/utils"

interface TagCloudProps {
  videos: YouTubeVideo[]
}

interface TagData {
  text: string
  value: number
  color: string
}

export function TagCloud({ videos }: TagCloudProps) {
  const [tags, setTags] = useState<TagData[]>([])

  // 태그 데이터 계산
  const calculateTags = useMemo(() => {
    const tagCounts = new Map<string, number>()
    
    // 모든 비디오의 태그를 순회하며 카운트
    videos.forEach(video => {
      if (!video.snippet.tags) return
      
      video.snippet.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    // 태그 데이터 변환 및 정렬
    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50) // 상위 50개만 표시
      .map(([text, value]) => ({
        text,
        value,
        color: getTagColor(value, Math.max(...tagCounts.values()))
      }))

    return sortedTags
  }, [videos])

  useEffect(() => {
    setTags(calculateTags)
  }, [calculateTags])

  // 태그 색상 계산
  const getTagColor = (value: number, maxValue: number) => {
    const intensity = (value / maxValue) * 100
    if (intensity > 75) return "text-primary font-bold text-lg"
    if (intensity > 50) return "text-primary/80 font-semibold text-base"
    if (intensity > 25) return "text-primary/60 font-medium text-sm"
    return "text-primary/40 font-normal text-xs"
  }

  // 태그 위치 랜덤화
  const getRandomPosition = () => {
    return {
      transform: `rotate(${Math.random() * 30 - 15}deg)`,
      margin: `${Math.random() * 1 + 0.5}rem`
    }
  }

  if (tags.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        태그 데이터가 없습니다.
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap justify-center gap-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`inline-block cursor-pointer transition-colors hover:text-primary ${tag.color}`}
              style={getRandomPosition()}
              title={`${tag.text} (${tag.value}회)`}
            >
              {tag.text}
            </span>
          ))}
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          총 {formatNumber(tags.length)}개의 태그
        </div>
      </CardContent>
    </Card>
  )
} 