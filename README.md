# Korea Weather App

대한민국 전용 날씨 웹 애플리케이션입니다. 현재 위치 기반 날씨, 지역 검색, 즐겨찾기 기능을 제공합니다.

## 실행 방법

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
```

[OpenWeatherMap](https://openweathermap.org/api)에서 무료 API 키를 발급받을 수 있습니다.

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build
pnpm start

# 테스트 실행
pnpm test
```

개발 서버 실행 후 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 구현된 기능

### 핵심 기능

| 기능 | 설명 | 상태 |
|------|------|------|
| 현재 위치 날씨 | 브라우저 Geolocation API로 현재 위치 날씨 표시 | ✅ |
| 지역 검색 | 대한민국 행정구역 자동완성 검색 | ✅ |
| 날씨 상세 | 현재 기온, 최저/최고 기온, 시간별 예보 | ✅ |
| 즐겨찾기 | 최대 6개 지역 즐겨찾기 (localStorage 저장) | ✅ |
| 별칭 수정 | 즐겨찾기 지역 별칭 편집 | ✅ |

### 에러 처리

| 상황 | 표시 메시지 |
|------|-------------|
| 위치 권한 거부 | 위치 권한 안내 + 검색 유도 |
| 데이터 없음 | "해당 장소의 정보가 제공되지 않습니다." |
| 네트워크 오류 | "네트워크 오류가 발생했습니다." |
| 즐겨찾기 초과 | "즐겨찾기는 최대 6개까지 추가할 수 있습니다." |

## 기술적 결정 사항

### Custom FSD (Feature-Sliced Design)

기존 FSD에서 `pages` 레이어를 제거하고 Next.js App Router의 `app/` 디렉토리가 페이지 역할을 대신합니다.

- **entities**: Read 작업 담당 (데이터 조회, 쿼리 훅, DTO→Domain 변환)
- **features**: CUD 작업 담당 (사용자 액션, 상태 변경)
- **widgets**: 화면 단위 UI 조합
- **shared**: 공용 유틸리티, UI 컴포넌트, 타입

```
Import 규칙: shared → entities → features → widgets → app
(역방향 import 금지)
```

### UI/비즈니스 로직 분리

- **UI 컴포넌트**: props 기반, 이벤트 콜백만 호출, 부수효과 최소화
- **비즈니스 로직**: hooks / store / service 레이어에서 처리
- **파생 상태**: useMemo/selector로 계산 (useEffect로 저장 지양)

### 상태 관리

| 상태 유형 | 관리 방식 |
|-----------|-----------|
| 서버 상태 (날씨, 지오코딩) | TanStack Query |
| 클라이언트 상태 (즐겨찾기) | Zustand + localStorage persist |

서버 데이터를 전역 스토어에 중복 저장하지 않습니다.

### Query Keys & 캐시 정책

```typescript
// Query Key 구조
['weather', lat, lon]      // 날씨 데이터
['geocode', fullName]      // 지오코딩 결과
```

- **staleTime**: 5분 (날씨 데이터 특성상 빈번한 갱신 불필요)
- **gcTime**: 30분 (메모리 효율성)
- **retry**: 3회 (네트워크 불안정 대비)

### 지역 → 좌표 → 날씨 전략

1. `korea_districts.json`에서 행정구역 검색 (클라이언트 사이드)
2. OpenWeatherMap Geocoding API로 좌표 변환 (프록시 라우트 사용)
3. OpenWeatherMap Weather API로 날씨 조회 (프록시 라우트 사용)
   - Current Weather API (`/data/2.5/weather`) - 현재 날씨
   - 5 Day Forecast API (`/data/2.5/forecast`) - 시간별 예보 (3시간 간격)
   - 무료 API 키로 사용 가능

**프록시 라우트** (`/api/geocode`, `/api/weather`)를 사용하여 API 키 노출을 방지합니다.

### "해당 장소의 정보가 제공되지 않습니다." 조건

다음 경우에 해당 메시지를 표시합니다:
- Geocoding API가 0개 결과 반환
- Weather API가 해당 좌표에 대해 데이터 없음 응답
- (네트워크/서버 오류는 별도 메시지 표시)

## 폴더 구조

```
├── app/                          # Next.js App Router
│   ├── api/                      # API 라우트 (프록시)
│   │   ├── geocode/route.ts
│   │   └── weather/route.ts
│   ├── place/[placeId]/page.tsx  # 상세 페이지
│   ├── layout.tsx
│   ├── page.tsx                  # 홈 페이지
│   └── providers.tsx             # 전역 프로바이더
│
├── entities/                     # Read 레이어
│   ├── location/                 # 위치/지역 관련
│   │   ├── api/                  # API 호출
│   │   ├── lib/                  # 유틸 (검색, 파싱)
│   │   ├── model/                # 훅 (useCurrentLocation, useGeocode)
│   │   └── types/
│   └── weather/                  # 날씨 관련
│       ├── api/
│       ├── lib/                  # 변환, 계산 함수
│       ├── model/                # useWeather 훅
│       ├── types/
│       └── ui/                   # WeatherCard, HourlyForecast
│
├── features/                     # CUD 레이어
│   ├── favorites/                # 즐겨찾기 CRUD
│   │   ├── model/                # Zustand store, useFavorites
│   │   ├── types/
│   │   └── ui/
│   └── location-search/          # 검색 기능
│       ├── model/
│       └── ui/                   # LocationSearchInput
│
├── widgets/                      # 화면 조합 레이어
│   ├── favorite-list/            # 즐겨찾기 목록
│   ├── home/                     # 홈 화면
│   └── place-detail/             # 상세 화면
│
├── shared/                       # 공용 레이어
│   ├── api/                      # queryClient
│   ├── constants/                # 메시지, queryKeys
│   ├── lib/                      # cn, fetcher
│   ├── types/
│   └── ui/                       # shadcn/ui 컴포넌트
│
├── __tests__/                    # 테스트 (FSD 구조 미러링)
└── korea_districts.json          # 대한민국 행정구역 데이터
```

## 기술 스택

| 카테고리 | 기술 |
|----------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI Library | React 19 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix UI) |
| Server State | TanStack Query 5 |
| Client State | Zustand 5 |
| Testing | Vitest + React Testing Library |
| Weather API | OpenWeatherMap |

## 제한 사항 및 향후 개선

### 현재 제한 사항

- 대한민국 지역만 지원
- Geocoding 결과 캐싱이 메모리/세션 단위 (영구 저장 없음)
- 오프라인 모드 미지원

### 향후 개선 가능 사항

- PWA 지원 (오프라인, 푸시 알림)
- 날씨 알림 기능
- 주간 예보 추가
- 다크 모드 토글 UI
- 지도 기반 위치 선택
- Geocoding 결과 IndexedDB 캐싱
- E2E 테스트 (Playwright)

## 라이선스

MIT
