# 유튜브 영상 검색 웹앱

유튜브 영상 검색 및 분석 기능을 제공하는 웹 애플리케이션입니다. 사용자가 키워드를 입력하면 관련 유튜브 영상을 검색하고, 해당 영상의 다양한 메타데이터(조회수, 구독자 수, 기여도, 성과도 등)를 분석하여 제공합니다.

## 주요 기능

- 키워드 검색: 사용자가 키워드를 입력하여 관련 유튜브 영상 검색
- 영상 분석: 검색된 영상의 메타데이터 분석 (조회수, 구독자 수, 기여도, 성과도 등)
- 채널 분석: 채널 정보 조회 및 분석
- 멤버십 관리: 멤버십 등급별 기능 제한 및 업그레이드

## 기술 스택

- **프론트엔드**: Next.js (App Router), TypeScript, ShadCN UI, TailwindCSS
- **백엔드**: Next.js API Routes (Route Handler), MongoDB, Mongoose
- **인증**: NextAuth.js
- **배포**: Vercel

## 시작하기

### 필수 조건

- Node.js 18.0.0 이상
- npm 또는 yarn
- MongoDB 데이터베이스

### 설치

1. 저장소 클론

```bash
git clone https://github.com/yourusername/youtube-video-search.git
cd youtube-video-search
```

2. 의존성 설치

```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정합니다:

```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

4. 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
```

5. 브라우저에서 `http://localhost:3000` 접속

## 프로젝트 구조

```
├── app/                  # Next.js App Router
│   ├── api/              # API 라우트 핸들러
│   ├── auth/             # 인증 관련 페이지
│   ├── dashboard/        # 대시보드 페이지
│   ├── search/           # 검색 페이지
│   └── ...
├── components/           # 재사용 가능한 컴포넌트
├── lib/                  # 유틸리티 함수 및 설정
├── models/               # MongoDB 모델 스키마
├── public/               # 정적 파일
└── ...
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여

기여는 언제나 환영합니다! 자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md) 파일을 참조하세요. 