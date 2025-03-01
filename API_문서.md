# 유튜브 영상 검색 웹앱 API 문서

## 목차
1. [인증 API](#인증-api)
2. [사용자 API](#사용자-api)
3. [키워드 검색 API](#키워드-검색-api)
4. [비디오 API](#비디오-api)
5. [멤버십 API](#멤버십-api)
6. [관리자 API](#관리자-api)

## 인증 API

### 회원가입
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **요청 본문**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "nickname": "사용자",
    "phone": "01012345678",
    "marketing_agree": "Y"
  }
  ```
- **응답**: 
  - 성공 (201):
    ```json
    {
      "message": "회원가입이 완료되었습니다.",
      "user": {
        "uid": "uuid-string",
        "email": "user@example.com",
        "nickname": "사용자",
        "phone": "01012345678",
        "marketing_agree": "Y",
        "user_tp": "10",
        "prod_tp": "10"
      }
    }
    ```
  - 실패 (400, 409, 500)

### 로그인
- **URL**: `/api/auth/[...nextauth]`
- **Method**: `POST`
- **요청 본문**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **응답**: 
  - 성공 (200): 세션 및 쿠키 설정
  - 실패 (401, 500)

## 사용자 API

### 사용자 정보 조회
- **URL**: `/api/auth/users`
- **Method**: `GET`
- **인증**: 필요
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "user": {
          "uid": "uuid-string",
          "email": "user@example.com",
          "nickname": "사용자",
          "phone": "01012345678",
          "marketing_agree": "Y",
          "user_tp": "10",
          "prod_tp": "10",
          "algorithm_use_count": 5
        },
        "membershipLimit": {
          "wt_use_count": { "10": 30, "20": 9999 },
          "ca_channel_count": { "10": 1, "20": 999 }
        },
        "coupon": {}
      }
    }
    ```
  - 실패 (401, 404, 500)

### 사용자 정보 업데이트
- **URL**: `/api/auth/users`
- **Method**: `PUT`
- **인증**: 필요
- **요청 본문**:
  ```json
  {
    "nickname": "새로운이름",
    "phone": "01087654321",
    "marketing_agree": "N"
  }
  ```
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "user": {
          "uid": "uuid-string",
          "email": "user@example.com",
          "nickname": "새로운이름",
          "phone": "01087654321",
          "marketing_agree": "N"
        }
      }
    }
    ```
  - 실패 (401, 404, 500)

## 키워드 검색 API

### 키워드 검색 요청
- **URL**: `/api/contents/videos/request/keyword`
- **Method**: `POST`
- **인증**: 필요
- **요청 본문**:
  ```json
  {
    "keyword": "유튜브 마케팅"
  }
  ```
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "history": {
          "keyword": "유튜브 마케팅",
          "round_no": "1",
          "status": "0",
          "uid": "uuid-string",
          "level": 1
        }
      }
    }
    ```
  - 실패 (400, 401, 404, 500)

### 키워드 히스토리 조회
- **URL**: `/api/contents/histories/keyword`
- **Method**: `GET`
- **인증**: 필요
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "histories": [
          {
            "keyword": "유튜브 마케팅",
            "status": "1",
            "round_no": "1",
            "level": 1,
            "_id": "id-string",
            "uid": "uuid-string"
          }
        ]
      }
    }
    ```
  - 실패 (401, 500)

## 비디오 API

### 비디오 목록 조회
- **URL**: `/api/contents/videos?round_no=1`
- **Method**: `GET`
- **인증**: 필요
- **쿼리 파라미터**: `round_no` (필수)
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "videos": [
          {
            "videoId": "video-id",
            "title": "유튜브 마케팅 전략",
            "thumbnail": "https://example.com/thumbnail.jpg",
            "duration": "10:30",
            "views": 15000,
            "subscribers": 5000,
            "contribution": "Good",
            "performance": "Normal",
            "exposureProbability": 0.75,
            "publishDate": "2023-01-01T00:00:00.000Z",
            "channelId": "channel-id",
            "channelTitle": "마케팅 채널",
            "keyword": "유튜브 마케팅",
            "round_no": "1",
            "uid": "uuid-string"
          }
        ],
        "history": {
          "keyword": "유튜브 마케팅",
          "round_no": "1",
          "status": "1",
          "level": 1,
          "_id": "id-string"
        },
        "filter": {}
      }
    }
    ```
  - 실패 (400, 401, 404, 500)

## 멤버십 API

### 멤버십 제한 조회
- **URL**: `/api/membership/limits`
- **Method**: `GET`
- **인증**: 필요
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "membershipLimit": {
          "wt_use_count": {
            "10": 30,
            "20": 9999,
            "21": 300,
            "22": 600,
            "23": 1500,
            "24": 100,
            "25": 9999
          },
          "ca_channel_count": {
            "10": 1,
            "20": 999,
            "21": 15,
            "22": 30,
            "23": 100,
            "24": 5,
            "25": 9999
          }
        }
      }
    }
    ```
  - 실패 (401, 500)

### 쿠폰 목록 조회
- **URL**: `/api/membership/coupons`
- **Method**: `GET`
- **인증**: 필요
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "coupons": [
          {
            "code": "COUPON123",
            "discount": 10,
            "discount_type": "percentage",
            "valid_from": "2023-01-01T00:00:00.000Z",
            "valid_to": "2023-12-31T23:59:59.999Z",
            "is_used": false,
            "user_id": "uuid-string"
          }
        ]
      }
    }
    ```
  - 실패 (401, 500)

### 쿠폰 등록
- **URL**: `/api/membership/coupons`
- **Method**: `POST`
- **인증**: 필요
- **요청 본문**:
  ```json
  {
    "code": "COUPON123"
  }
  ```
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "coupon": {
          "code": "COUPON123",
          "discount": 10,
          "discount_type": "percentage",
          "valid_from": "2023-01-01T00:00:00.000Z",
          "valid_to": "2023-12-31T23:59:59.999Z",
          "is_used": false,
          "user_id": "uuid-string"
        }
      }
    }
    ```
  - 실패 (400, 401, 403, 404, 500)

### 쿠폰 사용
- **URL**: `/api/membership/coupons`
- **Method**: `PUT`
- **인증**: 필요
- **요청 본문**:
  ```json
  {
    "couponId": "coupon-id"
  }
  ```
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "message": "쿠폰이 성공적으로 사용되었습니다.",
      "data": {
        "coupon": {
          "code": "COUPON123",
          "discount": 10,
          "discount_type": "percentage",
          "valid_from": "2023-01-01T00:00:00.000Z",
          "valid_to": "2023-12-31T23:59:59.999Z",
          "is_used": true,
          "user_id": "uuid-string"
        }
      }
    }
    ```
  - 실패 (400, 401, 403, 404, 500)

### 멤버십 업그레이드
- **URL**: `/api/membership/upgrade`
- **Method**: `POST`
- **인증**: 필요
- **요청 본문**:
  ```json
  {
    "prod_tp": "21",
    "couponId": "coupon-id"
  }
  ```
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "message": "멤버십이 성공적으로 업그레이드되었습니다.",
      "data": {
        "user": {
          "uid": "uuid-string",
          "email": "user@example.com",
          "nickname": "사용자",
          "prod_tp": "21"
        },
        "appliedCoupon": {
          "code": "COUPON123",
          "discount": 10,
          "discount_type": "percentage"
        }
      }
    }
    ```
  - 실패 (400, 401, 403, 404, 500)

### 멤버십 요청
- **URL**: `/api/membership/upgrade`
- **Method**: `PUT`
- **인증**: 필요
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "message": "멤버십 요청이 성공적으로 등록되었습니다.",
      "data": {
        "user": {
          "uid": "uuid-string",
          "email": "user@example.com",
          "nickname": "사용자",
          "membershipAskYn": "Y"
        }
      }
    }
    ```
  - 실패 (401, 404, 500)

## 관리자 API

### 사용자 목록 조회 (관리자용)
- **URL**: `/api/admin/users`
- **Method**: `GET`
- **인증**: 필요 (관리자)
- **쿼리 파라미터**: `email`, `nickname`, `prod_tp`, `membershipAskYn`, `page`, `limit`
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "users": [
          {
            "uid": "uuid-string",
            "email": "user@example.com",
            "nickname": "사용자",
            "user_tp": "10",
            "prod_tp": "10",
            "membershipAskYn": "N"
          }
        ],
        "pagination": {
          "total": 100,
          "page": 1,
          "limit": 10,
          "pages": 10
        }
      }
    }
    ```
  - 실패 (401, 403, 500)

### 사용자 정보 업데이트 (관리자용)
- **URL**: `/api/admin/users`
- **Method**: `PUT`
- **인증**: 필요 (관리자)
- **요청 본문**:
  ```json
  {
    "uid": "uuid-string",
    "prod_tp": "21",
    "membershipSuspended": false,
    "user_tp": "10"
  }
  ```
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "message": "사용자 정보가 성공적으로 업데이트되었습니다.",
      "data": {
        "user": {
          "uid": "uuid-string",
          "email": "user@example.com",
          "nickname": "사용자",
          "prod_tp": "21",
          "membershipSuspended": false,
          "user_tp": "10"
        }
      }
    }
    ```
  - 실패 (400, 401, 403, 404, 500)

### 키워드 히스토리 목록 조회 (관리자용)
- **URL**: `/api/admin/histories/keyword`
- **Method**: `GET`
- **인증**: 필요 (관리자)
- **쿼리 파라미터**: `keyword`, `uid`, `status`, `page`, `limit`
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "histories": [
          {
            "keyword": "유튜브 마케팅",
            "status": "1",
            "round_no": "1",
            "level": 1,
            "uid": "uuid-string",
            "userEmail": "user@example.com",
            "userNickname": "사용자"
          }
        ],
        "pagination": {
          "total": 100,
          "page": 1,
          "limit": 10,
          "pages": 10
        }
      }
    }
    ```
  - 실패 (401, 403, 500)

### 키워드 히스토리 업데이트 (관리자용)
- **URL**: `/api/admin/histories/keyword`
- **Method**: `PUT`
- **인증**: 필요 (관리자)
- **요청 본문**:
  ```json
  {
    "historyId": "history-id",
    "status": "1",
    "level": 2
  }
  ```
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "message": "키워드 히스토리가 성공적으로 업데이트되었습니다.",
      "data": {
        "history": {
          "keyword": "유튜브 마케팅",
          "status": "1",
          "round_no": "1",
          "level": 2,
          "uid": "uuid-string"
        }
      }
    }
    ```
  - 실패 (400, 401, 403, 404, 500)

### 비디오 목록 조회 (관리자용)
- **URL**: `/api/admin/videos`
- **Method**: `GET`
- **인증**: 필요 (관리자)
- **쿼리 파라미터**: `videoId`, `keyword`, `channelId`, `uid`, `round_no`, `page`, `limit`
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "videos": [
          {
            "videoId": "video-id",
            "title": "유튜브 마케팅 전략",
            "thumbnail": "https://example.com/thumbnail.jpg",
            "duration": "10:30",
            "views": 15000,
            "subscribers": 5000,
            "uid": "uuid-string",
            "round_no": "1",
            "userEmail": "user@example.com",
            "userNickname": "사용자",
            "historyKeyword": "유튜브 마케팅",
            "historyStatus": "1",
            "historyLevel": 1
          }
        ],
        "pagination": {
          "total": 100,
          "page": 1,
          "limit": 10,
          "pages": 10
        }
      }
    }
    ```
  - 실패 (401, 403, 500)

### 비디오 등록 (관리자용)
- **URL**: `/api/admin/videos`
- **Method**: `POST`
- **인증**: 필요 (관리자)
- **요청 본문**:
  ```json
  {
    "videoId": "video-id",
    "title": "유튜브 마케팅 전략",
    "thumbnail": "https://example.com/thumbnail.jpg",
    "duration": "10:30",
    "views": 15000,
    "subscribers": 5000,
    "channelId": "channel-id",
    "channelTitle": "마케팅 채널",
    "keyword": "유튜브 마케팅",
    "round_no": "1",
    "uid": "uuid-string",
    "publishDate": "2023-01-01T00:00:00.000Z"
  }
  ```
- **응답**: 
  - 성공 (201):
    ```json
    {
      "status": "success",
      "message": "비디오가 성공적으로 등록되었습니다.",
      "data": {
        "video": {
          "videoId": "video-id",
          "title": "유튜브 마케팅 전략",
          "thumbnail": "https://example.com/thumbnail.jpg",
          "duration": "10:30",
          "views": 15000,
          "subscribers": 5000,
          "channelId": "channel-id",
          "channelTitle": "마케팅 채널",
          "keyword": "유튜브 마케팅",
          "round_no": "1",
          "uid": "uuid-string",
          "publishDate": "2023-01-01T00:00:00.000Z"
        }
      }
    }
    ```
  - 실패 (400, 401, 403, 404, 409, 500)

### 비디오 업데이트 (관리자용)
- **URL**: `/api/admin/videos`
- **Method**: `PUT`
- **인증**: 필요 (관리자)
- **요청 본문**:
  ```json
  {
    "videoId": "video-id",
    "title": "업데이트된 제목",
    "views": 20000,
    "subscribers": 6000
  }
  ```
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "message": "비디오가 성공적으로 업데이트되었습니다.",
      "data": {
        "video": {
          "videoId": "video-id",
          "title": "업데이트된 제목",
          "views": 20000,
          "subscribers": 6000
        }
      }
    }
    ```
  - 실패 (400, 401, 403, 404, 500)

### 비디오 삭제 (관리자용)
- **URL**: `/api/admin/videos?videoId=video-id`
- **Method**: `DELETE`
- **인증**: 필요 (관리자)
- **쿼리 파라미터**: `videoId` (필수)
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "message": "비디오가 성공적으로 삭제되었습니다."
    }
    ```
  - 실패 (400, 401, 403, 404, 500)

### 쿠폰 생성 (관리자용)
- **URL**: `/api/admin/coupons`
- **Method**: `POST`
- **인증**: 필요 (관리자)
- **요청 본문**:
  ```json
  {
    "discount": 10,
    "discount_type": "percentage",
    "valid_days": 30,
    "user_id": "uuid-string",
    "count": 5
  }
  ```
- **응답**: 
  - 성공 (201):
    ```json
    {
      "status": "success",
      "message": "5개의 쿠폰이 성공적으로 생성되었습니다.",
      "data": {
        "coupons": [
          {
            "code": "ABCD1234",
            "discount": 10,
            "discount_type": "percentage",
            "valid_from": "2023-01-01T00:00:00.000Z",
            "valid_to": "2023-01-31T23:59:59.999Z",
            "is_used": false,
            "user_id": "uuid-string"
          }
        ]
      }
    }
    ```
  - 실패 (400, 401, 403, 404, 500)

### 쿠폰 목록 조회 (관리자용)
- **URL**: `/api/admin/coupons`
- **Method**: `GET`
- **인증**: 필요 (관리자)
- **쿼리 파라미터**: `is_used`, `user_id`
- **응답**: 
  - 성공 (200):
    ```json
    {
      "status": "success",
      "data": {
        "coupons": [
          {
            "code": "ABCD1234",
            "discount": 10,
            "discount_type": "percentage",
            "valid_from": "2023-01-01T00:00:00.000Z",
            "valid_to": "2023-01-31T23:59:59.999Z",
            "is_used": false,
            "user_id": "uuid-string"
          }
        ],
        "total": 5
      }
    }
    ```
  - 실패 (401, 403, 500) 