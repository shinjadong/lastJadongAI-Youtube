import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 숫자를 포맷팅하는 함수
 * 
 * @param value 포맷팅할 숫자
 * @returns 포맷팅된 문자열
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

/**
 * 날짜를 포맷팅하는 함수
 * 
 * @param dateString 포맷팅할 날짜 문자열
 * @returns 포맷팅된 날짜 문자열 (YYYY-MM-DD)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  
  // 유효한 날짜인지 확인
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\. /g, '-').replace(/\.$/, '');
}

/**
 * 시간을 포맷팅하는 함수
 * 
 * @param seconds 초 단위 시간
 * @returns 포맷팅된 시간 문자열 (HH:MM:SS)
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(hours.toString().padStart(2, '0'));
  }
  
  parts.push(minutes.toString().padStart(2, '0'));
  parts.push(remainingSeconds.toString().padStart(2, '0'));
  
  return parts.join(':');
}

export function calculateDuration(publishedAt: string): string {
  const published = new Date(publishedAt);
  const now = new Date();
  
  const diffInMs = now.getTime() - published.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 1) {
    return '오늘';
  } else if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  } else if (diffInDays < 30) {
    return `${Math.floor(diffInDays / 7)}주 전`;
  } else if (diffInDays < 365) {
    return `${Math.floor(diffInDays / 30)}개월 전`;
  } else {
    return `${Math.floor(diffInDays / 365)}년 전`;
  }
}

export function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

export function getPerformanceGrade(rate: number) {
  if (rate >= 80) return { grade: 'S', description: '매우 높은 영향력', color: 'primary' };
  if (rate >= 60) return { grade: 'A', description: '높은 영향력', color: 'primary' };
  if (rate >= 40) return { grade: 'B', description: '보통 영향력', color: 'secondary' };
  if (rate >= 20) return { grade: 'C', description: '낮은 영향력', color: 'secondary' };
  return { grade: 'D', description: '매우 낮은 영향력', color: 'destructive' };
}

export function getContributionGrade(rate: number) {
  if (rate >= 150) return { grade: 'High', description: '매우 높은 기여도', color: 'primary' };
  if (rate >= 100) return { grade: 'Good', description: '높은 기여도', color: 'primary' };
  if (rate >= 70) return { grade: 'Medium', description: '보통 기여도', color: 'secondary' };
  if (rate >= 40) return { grade: 'Low', description: '낮은 기여도', color: 'destructive' };
  return { grade: 'Poor', description: '매우 낮은 기여도', color: 'destructive' };
} 