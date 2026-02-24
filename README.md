<p align="center">
  <img src="docs/assets/banner.png" width="100%" alt="Open Plant banner" />
</p>

<p align="center">
  WebGL2 기반 고성능 WSI(Whole Slide Image) 뷰어 라이브러리
</p>

<p align="center">
  <a href="https://frorong.github.io/open-plant/">📖 Documentation</a>&nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://github.com/frorong/open-plant">GitHub</a>
</p>

---

## Why Open Plant

범용 지도/시각화 라이브러리로 병리 WSI를 렌더링하면 구조적 한계에 부딪힙니다.

| 범용 라이브러리의 한계 | Open Plant의 접근 |
|---|---|
| 타일 레이어와 포인트 레이어가 별도 렌더 패스로 분리되어 동기화 비용 발생 | 타일과 포인트를 **단일 WebGL2 렌더 루프**에서 합성. 카메라 변경 시 한 프레임 안에 동기 렌더 |
| 수십만 포인트에서 JS 객체 배열 기반 처리로 GC 압력과 프레임 드롭 | **TypedArray 직결 GPU 업로드**. JS 객체 할당 제로, per-frame CPU 루프 제로 |
| 줌 전환 시 이전 타일을 즉시 폐기해 검은 화면(black flash) 발생 | **fallback-first 렌더링**: 캐시된 저해상도 타일을 먼저 그려 시각적 연속성 보장 |
| 포인트 색상 변경 시 전체 데이터 재생성 필요 | **팔레트 텍스처 1장**만 갱신. geometry buffer 재업로드 없음 |
| 범용 인터랙션 모델에서 드로잉과 팬/줌이 충돌 | **드로잉 오버레이 격리**: draw mode 진입 시 팬 이벤트를 결정론적으로 잠금 |
| GIS 좌표계(EPSG 등) 변환 오버헤드 | 병리 이미지 픽셀 좌표계에 직접 매핑. 좌표 변환 오버헤드 제로 |
| 번들 크기 수백 KB~수 MB, 의존성 수십 개 | 외부 런타임 의존성 없이 React + WebGL2만으로 동작 |

## Features

| | |
|---|---|
| **WebGL2 타일 렌더링** | 멀티 티어 타일 피라미드, LRU 캐시(320장), 저해상도 fallback 렌더링 |
| **포인트 오버레이** | WebGL2 `gl.POINTS`로 수십, 수백만 개 포인트를 팔레트 텍스처 기반 컬러링. 파싱된 TypedArray만 입력 |
| **드로잉 / ROI 도구** | Freehand · Rectangle · Circular 도구로 관심 영역 지정 |
| **ROI 포인트 클리핑** | Ray-casting 기반 point-in-polygon으로 ROI 내부 포인트만 필터링 |
| **오버뷰 미니맵** | 썸네일 + 현재 뷰포트 인디케이터, 클릭/드래그 네비게이션 |
| **React 바인딩** | `<WsiViewerCanvas>`, `<DrawLayer>`, `<OverviewMap>` 컴포넌트 제공 |
| **좌표 변환** | `screenToWorld()` / `worldToScreen()` 양방향 좌표 변환 |
| **인증 지원** | Bearer 토큰 패스스루로 프라이빗 타일/포인트 엔드포인트 접근 |

## Quick Start

```bash
npm install
npm run dev:example
```

브라우저에서 `http://localhost:5174` 접속.

## Project Structure

```
src/
├── core/                       # WebGL2 저수준 렌더링 엔진
│   ├── gl-utils.ts             # 셰이더 컴파일, 프로그램 링킹
│   ├── ortho-camera.ts         # 2D 직교 카메라 (translate + zoom)
│   └── m1-tile-renderer.ts     # 기본 타일 렌더러
├── wsi/                        # WSI 전용 로직
│   ├── wsi-tile-renderer.ts    # 멀티 티어 타일 + 포인트 렌더러
│   ├── point-clip.ts           # ROI 포인트 클리핑
│   ├── image-info.ts           # 이미지 메타데이터 정규화
│   └── utils.ts                # 팔레트, 색상, 토큰 유틸리티
└── react/                      # React 컴포넌트
    ├── wsi-viewer-canvas.tsx   # 전체 기능 WSI 뷰어
    ├── draw-layer.tsx          # 드로잉 오버레이
    └── overview-map.tsx        # 미니맵
```

## React Components

### `<WsiViewerCanvas>`

전체 기능을 갖춘 WSI 뷰어 컴포넌트.

```jsx
import { WsiViewerCanvas } from "open-plant";

<WsiViewerCanvas
  source={imageSource}
  viewState={viewState}
  authToken={bearerToken}
  pointData={pointPayload}
  pointPalette={termPalette.colors}
  drawTool="freehand"
  onDrawComplete={handleDraw}
  onViewStateChange={handleViewChange}
  onStats={setStats}
/>
```

### `<DrawLayer>`

Freehand, Rectangle, Circular 드로잉 도구 오버레이.

### `<OverviewMap>`

현재 뷰포트를 표시하는 인터랙티브 미니맵.

## API

| Export | 설명 |
|---|---|
| `WsiTileRenderer` | WebGL2 WSI 타일 + 포인트 렌더러 클래스 |
| `M1TileRenderer` | 기본 타일 렌더러 클래스 |
| `normalizeImageInfo(raw, tileBaseUrl)` | API 응답 + 타일 베이스 URL을 `WsiImageSource`로 변환 |
| `filterPointDataByPolygons()` | ROI 폴리곤으로 포인트 필터링 |
| `buildTermPalette()` | Term 기반 컬러 팔레트 생성 |
| `toTileUrl()` | 타일 URL 생성 |

## Scripts

```bash
npm run dev            # 개발 서버 (기본 타일 그리드)
npm run dev:example    # 예제 앱 (전체 WSI 뷰어, port 5174)
npm run build          # 프로덕션 빌드
npm run build:example  # 예제 앱 빌드
npm run typecheck      # 타입 체크
```

## License

MIT
