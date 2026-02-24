# Open Plant Performance Optimization Points

기준: 현재 `open-plant` 코드베이스 (`src/wsi`, `src/react`)

## 1) 이미 적용된 최적화

### 1.1 WebGL2 렌더 경량 설정
- `WsiTileRenderer` 초기화 시 `antialias: false`, `depth: false`, `stencil: false`, `powerPreference: "high-performance"`로 불필요한 비용을 줄임.
- 타일/포인트를 단일 WebGL 컨텍스트에서 합성해 레이어 간 동기 비용을 줄임.

### 1.2 타일 스케줄링/네트워크 제어
- 동시 요청 제한(`maxConcurrency`)과 재시도 백오프(`maxRetries`, `retryBaseDelayMs`, `retryMaxDelayMs`) 적용.
- viewport에서 벗어난 타일은 queue/inflight에서 제거/abort 처리.
- 타일 우선순위를 `distance2` 기반으로 정렬해 화면 중심부터 채움.
- S3 URL(`amazonaws.com`, `s3.*`)에는 `Authorization` 헤더를 자동 제거해 불필요한 실패/재시도 방지.

### 1.3 타일 캐시 및 시각적 연속성
- 텍스처 캐시(Map) + LRU trim(`maxCacheTiles`) 적용.
- 현재 화면 타일이 비어도 cache fallback 타일을 먼저 그려 블랙 프레임을 줄임.

### 1.4 포인트 렌더 파이프라인
- 포인트 입력을 `Float32Array(positions)` + `Uint16Array(paletteIndices)`로 고정해 CPU/GPU 전송 비용 최소화.
- 팔레트는 1D 텍스처(`RGBA`)로 유지해 term 색 변경 시 전체 포인트 버퍼 재업로드를 피함.
- 포인트는 단일 draw call(`gl.POINTS`)로 렌더.
- 링 형태는 fragment shader에서 계산해 geometry 확장 없이 표현.

### 1.5 ROI 클리핑 경로 분리
- `sync`: 기준 경로
- `worker`: 메인 스레드 블로킹을 줄이는 기본 권장 경로
- `hybrid-webgpu`: bbox prefilter(WebGPU) + polygon 정밀 판정
- `onClipStats`로 mode/duration/input/output/candidate를 수집 가능.

### 1.6 Draw/UX 분리 렌더링
- 드로잉은 별도 Canvas 2D(`DrawLayer`)로 분리.
- draw mode에서 pointer capture + `interactionLock`로 pan/zoom 충돌 제거.
- draw overlay는 `requestAnimationFrame` 단위로만 갱신.

### 1.7 Overview Map 비용 제어
- 썸네일 생성 시 `maxThumbnailTiles` 제한으로 과도한 요청 방지.
- 자체 invalidate/ref 기반 redraw로 불필요한 재렌더를 줄임.

## 2) 측정/관측 포인트

실제 병목은 데이터/네트워크/기기별로 달라서, 아래 지표를 항상 함께 본다.

- 프레임 지표: `onStats` (`tier`, `visible`, `rendered`, `fallback`, `cache`, `inflight`)
- ROI 지표: `onClipStats` (`mode`, `durationMs`, `inputCount`, `outputCount`, `candidateCount`)
- 사용자 체감: zoom/pan 시 빈 타일 노출 여부, ROI draw 시 입력 지연 여부

## 3) 운영 기본값 권장

- ROI clip 기본값: `worker`
- WebGPU: `hybrid-webgpu`는 벤치마크로 이득이 확인된 환경에서만 opt-in
- 토큰 처리: S3 직결 URL에는 `Authorization` 미부착
