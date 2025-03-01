# MongoDB 데이터베이스 구조 및 관리자 기능 가이드

## 1. 데이터베이스 연결 정보

- **MongoDB Atlas URL**: `mongodb+srv://shinws8908:hi1120@cluster0.h7c55.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
- **데이터베이스 ID**: `662e9a1f5707f510d1e30b82`
- **사용자명**: `shinws8908`
- **비밀번호**: `hi1120`

## 2. 데이터베이스 연결 코드 예시

```javascript
const mongoose = require('mongoose');
const uri = "mongodb+srv://shinws8908:hi1120@cluster0.h7c55.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await mongoose.disconnect();
  }
}
run().catch(console.dir);
```

## 3. 데이터베이스 스키마 구조

### 3.1 User 스키마

사용자 정보를 저장하는 컬렉션입니다.

```typescript
interface IUser {
  uid: string;                    // 사용자 고유 ID (UUID)
  platform_id?: string;           // 소셜 로그인 시 플랫폼 ID
  email: string;                  // 이메일 (고유값)
  password?: string;              // 비밀번호 (해싱됨)
  nickname: string;               // 닉네임
  username: string;               // 사용자명 (고유값)
  phone?: string;                 // 전화번호
  user_tp: string;                // 사용자 유형 (10: 일반 사용자, 20: 관리자)
  gender?: string;                // 성별 (M/F)
  birthday?: string;              // 생년월일
  pt_yn: string;                  // PT 여부 (Y/N)
  pt_tp?: string;                 // PT 유형
  help_yn: string;                // 도움말 표시 여부 (Y/N)
  loyalty_yn: string;             // 로열티 프로그램 참여 여부 (Y/N)
  marketing_agree: string;        // 마케팅 동의 여부 (Y/N)
  algorithm_use_count: number;    // 알고리즘 사용 횟수
  ca_channel_use_count: number;   // 채널 분석 사용 횟수
  ca_use_count: number;           // 콘텐츠 분석 사용 횟수
  cm_use_count: number;           // 콘텐츠 관리 사용 횟수
  km_use_count: number;           // 키워드 관리 사용 횟수
  ca_channel_count: number;       // 채널 등록 수
  create_dt: Date;                // 생성일
  country: string;                // 국가 코드
  lang: string;                   // 언어 코드
  membershipSuspended: boolean;   // 멤버십 정지 여부
  membershipAskYn: string;        // 멤버십 요청 여부 (Y/N)
  prod_tp: string;                // 멤버십 유형 (10: 기본, 21: 스타터, 22: 프로, 23: 엔터프라이즈, 24: 체험, 25: 무제한)
  code?: string;                  // 인증 코드
  codeState?: string;             // 인증 코드 상태
  hotMasterFlag: boolean;         // 핫 마스터 플래그
  lectureId?: string;             // 강의 ID
  dormant_account_yn: string;     // 휴면 계정 여부 (Y/N)
}
```

### 3.2 KeywordHistory 스키마

키워드 검색 기록을 저장하는 컬렉션입니다.

```typescript
interface IKeywordHistory {
  keyword: string;                // 검색 키워드
  newKeyword?: boolean;           // 신규 키워드 여부
  country: string;                // 국가 코드
  lang: string;                   // 언어 코드
  recKeywords?: string[];         // 추천 키워드 목록
  deletedKeywords?: string[];     // 삭제된 키워드 목록
  round_no: string;               // 라운드 번호
  status: string;                 // 상태 (0: 진행중, 1: 완료)
  uid: string;                    // 사용자 ID
  use_yn: string;                 // 사용 여부 (Y/N)
  scheduler_yn: string;           // 스케줄러 사용 여부 (Y/N)
  video_tp: string;               // 비디오 유형
  level: number;                  // 레벨
  create_user: string;            // 생성자
  create_dt: Date;                // 생성일
  update_user: string;            // 수정자
  update_dt: Date;                // 수정일
}
```

### 3.3 Video 스키마

유튜브 비디오 정보를 저장하는 컬렉션입니다.

```typescript
interface IVideo {
  videoId: string;                // 유튜브 비디오 ID
  title: string;                  // 비디오 제목
  thumbnail: string;              // 썸네일 URL
  duration: string;               // 재생 시간 (ISO 8601 형식)
  views: number;                  // 조회수
  subscribers: number;            // 구독자 수
  contribution: string;           // 기여도 (Good, Normal, Bad, Worst)
  performance: string;            // 성과도 (Good, Normal, Bad, Worst)
  exposureProbability: number;    // 노출 확률
  totalVideos: number;            // 총 비디오 수
  publishDate: Date;              // 게시일
  channelId: string;              // 채널 ID
  channelTitle: string;           // 채널 제목
  keyword: string;                // 검색 키워드
  round_no: string;               // 라운드 번호
  uid: string;                    // 사용자 ID
  create_dt: Date;                // 생성일
  update_dt: Date;                // 수정일
}
```

### 3.4 MembershipLimit 스키마

멤버십 유형별 사용 제한을 저장하는 컬렉션입니다.

```typescript
interface IMembershipLimit {
  wt_use_count: {                 // 워크스루 사용 횟수
    "10": number;                 // 기본 플랜
    "20": number;                 // 프리미엄 플랜
    "21": number;                 // 스타터 플랜
    "22": number;                 // 프로 플랜
    "23": number;                 // 엔터프라이즈 플랜
    "24": number;                 // 체험 플랜
    "25": number;                 // 무제한 플랜
    "61": number;                 // 추가 멤버십 유형
  };
  ca_channel_count: Record<string, number>;    // 채널 등록 수
  ca_channel_use_count: Record<string, number>; // 채널 분석 사용 횟수
  ca_use_count: Record<string, number>;        // 콘텐츠 분석 사용 횟수
  cm_use_count: Record<string, number>;        // 콘텐츠 관리 사용 횟수
  km_use_count: Record<string, number>;        // 키워드 관리 사용 횟수
  algorithm_use_count: Record<string, number>; // 알고리즘 사용 횟수
}
```

### 3.5 Coupon 스키마

쿠폰 정보를 저장하는 컬렉션입니다.

```typescript
interface ICoupon {
  code: string;                   // 쿠폰 코드
  discount: number;               // 할인 금액/비율
  discount_type: string;          // 할인 유형 (percentage, fixed)
  valid_from: Date;               // 유효 시작일
  valid_to: Date;                 // 유효 종료일
  is_used: boolean;               // 사용 여부
  user_id: string;                // 사용자 ID
  create_dt: Date;                // 생성일
}
```

## 4. 관리자 기능 사용법

### 4.1 관리자 대시보드

관리자 대시보드에서는 시스템의 전반적인 통계 정보를 확인할 수 있습니다.

- **접근 경로**: `/admin`
- **필요 권한**: 관리자 권한 (user_tp: "20")
- **주요 기능**:
  - 총 사용자 수, 키워드 수, 비디오 수, 쿠폰 수 통계 확인
  - 멤버십 요청 현황 확인
  - 최근 가입 사용자 목록 확인
  - 최근 검색 키워드 목록 확인
  - 다른 관리자 기능으로의 빠른 이동

### 4.2 사용자 관리

사용자 정보를 관리하는 기능입니다.

- **접근 경로**: `/admin/users`
- **필요 권한**: 관리자 권한 (user_tp: "20")
- **주요 기능**:
  - 사용자 목록 조회 (이메일, 닉네임 검색 가능)
  - 멤버십 유형, 사용자 유형, 멤버십 요청 여부 필터링
  - 사용자 정보 수정 (멤버십 유형, 사용자 유형, 멤버십 정지 여부)
  - 새 사용자 추가 (이메일, 비밀번호, 닉네임, 전화번호, 멤버십, 사용자 유형)
  - 사용자 삭제

#### 사용자 추가 방법
1. "사용자 추가" 버튼 클릭
2. 필수 정보 입력 (이메일, 비밀번호, 닉네임)
3. 선택 정보 입력 (전화번호, 멤버십, 사용자 유형)
4. "생성" 버튼 클릭

#### 사용자 정보 수정 방법
1. 사용자 목록에서 "관리" 버튼 클릭
2. 멤버십 유형, 사용자 유형, 멤버십 정지 여부 수정
3. "저장" 버튼 클릭

#### 사용자 삭제 방법
1. 사용자 목록에서 "삭제" 버튼 클릭
2. 확인 다이얼로그에서 "삭제" 버튼 클릭

### 4.3 키워드 히스토리 관리

사용자들이 검색한 키워드 히스토리를 관리하는 기능입니다.

- **접근 경로**: `/admin/keywords`
- **필요 권한**: 관리자 권한 (user_tp: "20")
- **주요 기능**:
  - 키워드 목록 조회 (키워드 검색 가능)
  - 상태, 레벨 필터링
  - 키워드 삭제
  - 키워드 검색 결과 확인

#### 키워드 검색 결과 확인 방법
1. 키워드 목록에서 "결과 보기" 버튼 클릭
2. 해당 키워드의 검색 결과 페이지로 이동

#### 키워드 삭제 방법
1. 키워드 목록에서 "삭제" 버튼 클릭
2. 확인 다이얼로그에서 "삭제" 버튼 클릭

### 4.4 비디오 관리

검색된 유튜브 비디오를 관리하는 기능입니다.

- **접근 경로**: `/admin/videos`
- **필요 권한**: 관리자 권한 (user_tp: "20")
- **주요 기능**:
  - 비디오 목록 조회 (제목 검색 가능)
  - 기여도, 성과도 필터링
  - 조회수, 구독자 수, 업로드 날짜 기준 정렬
  - 비디오 삭제
  - 유튜브에서 비디오 보기

#### 비디오 필터링 및 정렬 방법
1. 제목 검색창에 검색어 입력 후 검색
2. 기여도, 성과도 필터 선택
3. 정렬 기준 선택 (조회수, 구독자 수, 업로드 날짜)

#### 비디오 삭제 방법
1. 비디오 목록에서 "삭제" 버튼 클릭
2. 확인 다이얼로그에서 "삭제" 버튼 클릭

### 4.5 쿠폰 관리

멤버십 할인 쿠폰을 관리하는 기능입니다.

- **접근 경로**: `/admin/coupons`
- **필요 권한**: 관리자 권한 (user_tp: "20")
- **주요 기능**:
  - 쿠폰 목록 조회 (쿠폰 코드 검색 가능)
  - 사용 여부 필터링
  - 새 쿠폰 생성
  - 쿠폰 정보 확인 (할인 금액/비율, 유효 기간, 사용 여부, 할당된 사용자)

#### 쿠폰 생성 방법
1. "쿠폰 생성" 버튼 클릭
2. 할인 금액/비율 입력
3. 할인 유형 선택 (퍼센트, 고정 금액)
4. 유효 기간 설정
5. 사용자 ID 입력 (선택 사항)
6. 생성할 쿠폰 수량 입력
7. "생성" 버튼 클릭

## 5. 데이터베이스 관리 스크립트

### 5.1 데이터베이스 연결 테스트

```javascript
// scripts/test-db-connection.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('MongoDB에 연결 중...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공!');
    
    // 데이터베이스 정보 출력
    const admin = mongoose.connection.db.admin();
    const dbInfo = await admin.serverInfo();
    console.log('MongoDB 버전:', dbInfo.version);
    
    // 컬렉션 목록 출력
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n사용 가능한 컬렉션:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  }
}

testConnection();
```

### 5.2 초기 데이터 생성

```javascript
// scripts/init-db.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

const MONGODB_URI = process.env.MONGODB_URI;

// 관리자 계정 생성 및 멤버십 제한 정보 설정
async function initializeDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공!');

    // 관리자 계정 생성
    const hashedPassword = await bcrypt.hash('admin123', await bcrypt.genSalt(10));
    
    const adminUser = {
      uid: randomUUID(),
      email: 'admin@example.com',
      password: hashedPassword,
      nickname: '관리자',
      username: '관리자',
      user_tp: '20', // 관리자 유형
      prod_tp: '25', // 무제한 플랜
      marketing_agree: 'Y',
      create_dt: new Date(),
      create_user: 'system',
      update_user: 'system',
    };
    
    await mongoose.connection.db.collection('users').insertOne(adminUser);
    console.log('관리자 계정이 생성되었습니다.');
    
    // 멤버십 제한 정보 생성
    const membershipLimit = {
      wt_use_count: {
        "10": 30, "20": 9999, "21": 300, "22": 600, "23": 1500, "24": 100, "25": 9999, "61": 9999
      },
      ca_channel_count: {
        "10": 1, "20": 999, "21": 15, "22": 30, "23": 100, "24": 5, "25": 9999, "61": 9999
      },
      ca_channel_use_count: {
        "10": 1, "20": 999, "21": 15, "22": 30, "23": 100, "24": 5, "25": 9999, "61": 9999
      },
      ca_use_count: {
        "10": 1, "20": 999, "21": 30, "22": 60, "23": 200, "24": 10, "25": 9999, "61": 9999
      },
      cm_use_count: {
        "10": 2, "20": 999, "21": 30, "22": 100, "23": 300, "24": 10, "25": 9999, "61": 9999
      },
      km_use_count: {
        "10": 2, "20": 999, "21": 30, "22": 100, "23": 300, "24": 10, "25": 9999, "61": 9999
      },
      algorithm_use_count: {
        "10": 0, "20": 999, "21": 90, "22": 300, "23": 1000, "24": 30, "25": 9999, "61": 9999
      }
    };
    
    await mongoose.connection.db.collection('membershiplimits').insertOne(membershipLimit);
    console.log('멤버십 제한 정보가 생성되었습니다.');
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  }
}

initializeDatabase();
```

### 5.3 샘플 데이터 생성

```javascript
// scripts/create-sample-data.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const MONGODB_URI = process.env.MONGODB_URI;

async function createSampleData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공!');

    // 샘플 키워드 히스토리 생성
    const keywordData = [
      { keyword: "사업자등록증내는법", status: "1", round_no: "42", level: 1 },
      { keyword: "레버리지", status: "1", round_no: "41", level: 1 },
      { keyword: "cctv", status: "1", round_no: "40", level: 2 },
      { keyword: "CCTV설치", status: "1", round_no: "39", level: 2 },
      { keyword: "에어컨창업", status: "1", round_no: "38", level: 1 }
    ];
    
    const uid = randomUUID();
    
    for (const data of keywordData) {
      await mongoose.connection.db.collection('keywordhistories').insertOne({
        ...data,
        uid,
        country: 'KR',
        lang: 'ko',
        use_yn: 'Y',
        scheduler_yn: 'N',
        video_tp: '02',
        create_user: uid,
        update_user: uid,
        create_dt: new Date(),
        update_dt: new Date()
      });
    }
    
    console.log('샘플 키워드 히스토리가 생성되었습니다.');
    
    // 샘플 비디오 데이터 생성
    const videoData = [
      {
        videoId: "sample1",
        title: "CCTV 설치 가이드: 초보자도 쉽게 따라하는 방법",
        thumbnail: "https://i.ytimg.com/vi/sample1/hqdefault.jpg",
        duration: "PT15M30S",
        views: 125000,
        subscribers: 50000,
        contribution: "Good",
        performance: "Good",
        exposureProbability: 0.75,
        totalVideos: 120,
        publishDate: new Date(),
        channelId: "channel1",
        channelTitle: "DIY 전문가",
        keyword: "CCTV설치",
        round_no: "39",
        uid,
        create_dt: new Date(),
        update_dt: new Date()
      },
      {
        videoId: "sample2",
        title: "집에서 직접 CCTV 설치하는 방법 (비용 절약 팁)",
        thumbnail: "https://i.ytimg.com/vi/sample2/hqdefault.jpg",
        duration: "PT8M45S",
        views: 89000,
        subscribers: 35000,
        contribution: "Normal",
        performance: "Good",
        exposureProbability: 0.65,
        totalVideos: 85,
        publishDate: new Date(),
        channelId: "channel2",
        channelTitle: "생활의 달인",
        keyword: "CCTV설치",
        round_no: "39",
        uid,
        create_dt: new Date(),
        update_dt: new Date()
      }
    ];
    
    for (const data of videoData) {
      await mongoose.connection.db.collection('videos').insertOne(data);
    }
    
    console.log('샘플 비디오 데이터가 생성되었습니다.');
  } catch (error) {
    console.error('샘플 데이터 생성 오류:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  }
}

createSampleData();
```

## 6. 주의사항 및 팁

1. **보안**: MongoDB 연결 문자열에는 사용자 이름과 비밀번호가 포함되어 있으므로, 이 정보를 공개 저장소에 업로드하지 않도록 주의하세요.

2. **백업**: 중요한 데이터는 정기적으로 백업하세요. MongoDB Atlas는 자동 백업 기능을 제공합니다.

3. **인덱스**: 자주 조회하는 필드에 인덱스를 생성하여 쿼리 성능을 향상시키세요.
   ```javascript
   // 예: 이메일 필드에 인덱스 생성
   db.users.createIndex({ email: 1 }, { unique: true });
   ```

4. **쿼리 최적화**: 필요한 필드만 선택하여 쿼리 성능을 향상시키세요.
   ```javascript
   // 예: 사용자 이메일과 닉네임만 조회
   db.users.find({}, { email: 1, nickname: 1 });
   ```

5. **에러 처리**: MongoDB 작업 시 항상 적절한 에러 처리를 구현하세요.

6. **연결 관리**: 연결 풀을 효율적으로 관리하고, 사용하지 않는 연결은 닫아주세요.

7. **모니터링**: MongoDB Atlas 대시보드를 통해 데이터베이스 성능을 모니터링하세요.

## 7. 문제 해결

### 7.1 일반적인 오류

1. **연결 오류**: MongoDB 연결 문자열이 올바른지, 네트워크 연결이 정상인지 확인하세요.

2. **인증 오류**: 사용자 이름과 비밀번호가 올바른지 확인하세요.

3. **중복 키 오류**: 고유 인덱스가 설정된 필드에 중복 값을 삽입하려고 할 때 발생합니다.
   - 예: `E11000 duplicate key error collection: test.users index: username_1 dup key: { username: null }`
   - 해결: 해당 필드에 고유한 값을 지정하거나, 필드가 null이 아닌지 확인하세요.

4. **타임아웃 오류**: 쿼리 실행 시간이 너무 길 경우 발생합니다. 인덱스를 추가하거나 쿼리를 최적화하세요.

### 7.2 특정 오류 해결

#### username 필드 중복 오류
사용자 생성 시 `username` 필드가 null인 경우 중복 키 오류가 발생할 수 있습니다.

```javascript
// 해결 방법: username 필드에 nickname 값 할당
const newUser = {
  uid: randomUUID(),
  email: "user@example.com",
  password: hashedPassword,
  nickname: "사용자",
  username: "사용자", // nickname과 동일한 값 사용
  // 기타 필드...
};
```

## 8. 참고 자료

- [MongoDB 공식 문서](https://docs.mongodb.com/)
- [Mongoose 공식 문서](https://mongoosejs.com/docs/)
- [MongoDB Atlas 문서](https://docs.atlas.mongodb.com/)
