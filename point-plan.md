# Point Rendering Plan (zst -> all points, max performance)

## 1. 목표

- 목표: `zst` 바이너리를 받아 **모든 point를 즉시 렌더링**하는 병리 전용 고성능 경로 구축.
- 기준 URL:
- `https://{S3_BUCKET}.s3.{REGION}.amazonaws.com/{path}/{image_id}/S3-test.zst`
- 핵심 요구:
- 초기 로드 후 point 전체 표시
- zoom/pan 중 프레임 안정성 유지
- term별 색상 정확 반영
- 불필요 기능 제거(ROI 폴리곤 검사, 고비용 CPU 필터, UI 부가기능)

## 2. 성능 원칙 (강제)

- JS 객체 배열 금지: point는 `Struct of Arrays(TypedArray)`만 사용.
- 메인 스레드에서 zstd 해제 금지: **Worker + WASM decoder** 필수.
- 렌더 루프 내 CPU 루프 최소화: per-frame CPU filter/transform 금지.
- GPU 업로드 1회 원칙: 데이터 변경 없는 한 buffer 재생성 금지.
- 드로우콜 최소화: point layer 단일 프로그램/단일 패스 우선.

## 3. 비목표 (v0에서 제거)

- ROI 내부 판정(`isPointInPolygon`) 실시간 계산
- DataFilterExtension 기반 다차원 필터
- prerender bitmap/scatter 페이드 혼합
- pickable/hit-test
- term 통계 집계 UI

## 4. 입력/출력 계약

## 4.1 입력

- image info API에서 최소 메타 사용:
- `width`, `height`, `terms[]`
- zst URL:
- `mvtPath` 또는 직접 지정 URL

## 4.2 출력

- WebGL2 canvas 위 point 렌더
- 카메라 연동(현재 tile viewer의 pan/zoom 상태 공유)
- term별 색상 출력 (없으면 fallback)

## 5. term 색상 규칙

- 우선순위:
1. API `terms[].termColor`
2. 런타임 override 팔레트
3. fallback `DEFAULT_POINT_COLOR = [160,160,160,255]`
- term id -> palette index 매핑 테이블 고정 생성:
- `Map<string, uint16>`
- 셰이더에서는 `termIndex`로 palette를 조회
- 색상 업데이트는 palette texture만 갱신(geometry buffer 재업로드 금지)
- 예시(제공된 메타 기준):
- `termId: "66d54d4989181badfeac2d79"(Positive) -> #e51d07`
- `termId: "66d54d5c89181badfeac2d7d"(Negative) -> #0586ec`
- 매핑 실패 시 fallback gray

## 6. 데이터 파이프라인

## 6.1 Fetch

- `fetch(zstUrl)` with `AbortController`
- `response.arrayBuffer()` 수신
- 진행률 표시가 필요하면 stream reader 추가(선택)

## 6.2 Decompress (Worker)

- 전용 worker에서 zstd 해제:
- 후보: WASM 기반 decoder 1개 고정(성능 검증 후 확정)
- 반환: decompressed `ArrayBuffer` (transferable)
- 실패 시 즉시 에러(재시도 1회만)

## 6.3 Parse (Worker)

- 바이너리 스키마를 파싱해 SoA 생성:
- `x: Float32Array`
- `y: Float32Array`
- `termIndex: Uint16Array` (또는 Uint8 if <=255)
- 선택: `intensity: Float32Array`
- 파싱 결과를 transfer로 메인 스레드 전달

## 6.4 Upload (Main)

- GPU buffer 생성:
- `positionBuffer` (x,y interleave or split)
- `termBuffer` (integer attribute)
- palette texture 1개(RGBA8, 1D/2D)
- 이후 카메라 변경 시 uniform만 변경

## 7. 렌더 전략 (WebGL2, v0)

- Draw mode:
- `gl.POINTS` 우선 (가장 단순/빠름)
- 점 크기:
- zoom 기반 piecewise 함수(고정 table)
- Fragment:
- term palette lookup
- 작은 반경에서 원형 마스크 처리(옵션)
- 블렌딩:
- premultiplied alpha 기준 단일 블렌드 모드

## 8. Zoom 성능 전략

- v0: all points 고정 렌더 + point radius만 zoom 반영
- v1(필요 시): 레벨별 샘플 마스크 또는 grid bin LOD 추가
- 정책:
- 초기에는 정확도 우선(all points), 필요 시에만 LOD 도입
- CPU random LOD 금지(결과 비결정성/깜빡임 원인)

## 9. 메모리 예산

- 예시(10M points):
- `x,y Float32` = 8 * 10M = 80MB
- `termIndex Uint16` = 2 * 10M = 20MB
- 합계 원본 약 100MB + GPU copy
- 목표:
- 파싱 중 복사 횟수 최소화(가능하면 zero-copy/transfer)
- 중복 배열 생성을 금지

## 10. 구현 단계

## Step 0. 포맷 고정

- zst 내부 바이너리 레이아웃 문서화(헤더/endianness/offset)
- 샘플 파일 1개로 파서 golden test 작성

## Step 1. 로더

- `PointDataLoader`:
- `load(url, signal) -> { count, x, y, termIndex }`
- worker + wasm decoder 연결

## Step 2. 렌더러

- `PointRendererGL`:
- `setData(soa)`
- `setPalette(termColorMap)`
- `setCamera(viewState)`
- `draw()`

## Step 3. 뷰어 통합

- tile viewer의 카메라 상태를 point renderer와 공유
- pan/zoom 시 point layer 동기 렌더

## Step 4. 최소 제어 API

- `setTermVisibility(termId, visible)`:
- 구현은 alpha mask texture/bitset 기반으로 처리
- per-point color 배열 재생성 금지

## 11. 검증 항목 (완료 기준)

- 초기 로드:
- zst fetch + decode + 첫 렌더 완료
- 시각:
- term 색상이 API 정의와 일치
- 상호작용:
- pan/zoom 중 black frame/깜빡임 없음
- 성능:
- 목표 해상도(1080p)에서 pan/zoom p95 frame time <= 16.7ms(>= 60fps 근접)
- zst decode+parse 파이프라인이 메인 스레드 long task(>50ms) 유발하지 않음
- point data 재업로드 없는 상태에서 zoom 연속 입력 시 드롭 프레임 급증 없음
- 메모리:
- zoom/pan 반복 시 메모리 누수 없음

## 12. 즉시 적용할 정리 (현재 deck 코드 기준)

- 제거:
- `DataFilterExtension`
- `isPointInPolygon` 루프
- `prerenderedLayer` 생성 파이프라인
- `Math.random()` 기반 LOD
- 유지:
- termColorMap 생성 로직(단, GPU palette 방식으로 변환)
- point radius zoom curve 개념(셰이더 uniform으로 이전)

## 13. 리스크 / 대응

- zst 포맷 불명확:
- 먼저 포맷 스펙 확보, 없으면 reverse-engineer 스크립트 작성
- 브라우저별 worker/wasm 차이:
- decoder fallback 1개만 허용(성능 확인된 경우)
- 초대용량에서 VRAM 부족:
- chunk 업로드 + draw range 분할

## 14. 다음 액션

1. zst 내부 포맷 스펙 확보(필수)
2. Worker zstd decode 프로토타입 작성
3. SoA -> WebGL point renderer 최소 경로 구현
4. term palette texture 적용
