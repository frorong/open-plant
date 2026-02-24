# Open Plant Viewer Plan (v0)

fsd아키텍처를 사용하고, biome을 포매터로 사용한다.

## 0. 목표와 원칙

- 목표: 병리 WSI(Whole Slide Image)를 브라우저에서 WebGL 기반으로 고성능 렌더링하는 React 라이브러리 구축.
- 1차 범위: 타일 렌더, 드래그 팬, 줌(휠/핀치/더블클릭), 안정적인 LOD 전환.
- 원칙: deck.gl 철학 계승(레이어 중심, 데이터 중심, 최소 API, 예측 가능한 상태 흐름, 성능 우선).
- 비목표(초기 제외): 측정 툴, 주석 UI, 복잡한 편집 기능, 스타일 편집기.

## 1. 제품/기술 요구사항

- 대용량 WSI 타일을 끊김 없이 렌더링.
- 타일 스킴 지원:
- `IMS`: `/tiles/TileGroup0/{path}/{tierZoom}/{y}_{x}.webp`
- `PIMS`: `/pims/image/{path}/normalized-tile/zoom/{tierZoom}/ti/{tileIndex}.jpg`
- 좌표계: 이미지 픽셀 좌표 기반(원점 좌상단), 뷰포트 변환은 카메라 행렬로 처리.
- React 친화 API + 내부 렌더 코어 분리(React는 상태/생명주기, 코어는 GPU/스케줄링).
- WebGPU는 초기에는 연산 가속 경로만 준비(overlay 데이터 전처리/집계), 렌더는 WebGL 고정.

## 2. 아키텍처 초안

- 패키지 분리:
- `@open-plant/core`: 렌더 루프, 타일 스케줄러, 캐시, 카메라, 이벤트 처리.
- `@open-plant/react`: `<Viewer />`, 훅, prop 바인딩, imperative handle.
- 주요 모듈:
- `camera`: pan/zoom 상태, world<->screen 변환, clamp.
- `tile-grid`: 줌 레벨별 가시 타일 계산.
- `tile-source`: URL 생성기(IMS/PIMS), fetch + abort.
- `tile-cache`: 메모리/LRU 캐시(ImageBitmap + 메타).
- `renderer-gl`: 텍스처 업로드, 타일 쿼드 배치 렌더.
- `interaction`: pointer/wheel/gesture 처리.
- `overlay-buffer`(준비): ArrayBuffer 기반 point 데이터 GPU 업로드 경로.

## 3. 1차 마일스톤 (Tile + Pan + Zoom)

### M1. 최소 렌더 파이프라인

- Canvas/WebGL2 초기화, resize 대응(devicePixelRatio 포함).
- 2D orthographic 카메라 구현(translate + scale).
- 타일 쿼드 셰이더 1종(텍스처 샘플링) 작성.
- 단일 고정 줌 레벨 타일 렌더 성공.

### M2. 타일 인덱싱/요청 시스템

- 가시 영역에서 필요한 타일 인덱스 계산.
- `IMS/PIMS` URL 빌더 구현(`calculateTileIndex` 포함).
- fetch 취소(AbortController) + 우선순위 로딩(화면 중심 우선).
- 실패 타일 재시도 정책(짧은 백오프, 최대 횟수 제한).

### M3. LOD + 캐시

- 현재 줌에 맞는 레벨 선택, `best-available` 전략 적용.
- 부모/자식 타일 페이드 전환으로 팝인 최소화.
- LRU 캐시(개수/메모리 기준), out-of-view 타일 정리.
- ImageBitmap decode 경로 표준화(createImageBitmap 우선).

### M4. 인터랙션

- 드래그 팬(pointer events + inertia 옵션 플래그).
- 줌:
- 휠 줌(커서 고정점 중심)
- 더블클릭 줌 in/out
- 핀치 줌(터치)
- 경계 clamp(이미지 밖 과도 이동 방지), min/max zoom 보정.

### M5. React API 정리

- `<Viewer image={...} tileSource="ims|pims" />`
- 제어/비제어 뷰 상태(`viewState`, `onViewStateChange`).
- imperative API(`zoomIn`, `zoomOut`, `fitBounds`, `setViewState`).
- StrictMode에서 중복 init 안전성 보장.

## 4. 성능 설계 기준 (초기 SLO)

- 팬/줌 상호작용 중 메인 스레드 프레임 드랍 최소화.
- 타일 decode/업로드 지연이 있어도 인터랙션 FPS 유지(렌더 루프 분리).
- 타일 요청 폭주 방지(동시 요청 수 제한 + 큐 스케줄링).
- 메모리 상한 관리(캐시 상한 초과 시 즉시 LRU 해제).
- 대형 슬라이드에서도 초기 표시 시간 단축(저해상도 레벨 선로딩).

## 5. 데이터 경로 (향후 Point Overlay 대비)

- 입력: `ArrayBuffer`/`SharedArrayBuffer` 기반 binary schema.
- CPU 파싱 최소화: interleaved buffer를 그대로 GPU 업로드 가능하게 설계.
- WebGPU(계산 가속) 적용 지점:
- 가시 영역 필터링
- binning/aggregation
- style attribute precompute
- 결과는 WebGL 렌더 경로로 브리지(초기 단계).

## 6. 구현 순서 (실행 체크리스트)

- [ ] core skeleton 생성(`renderer`, `camera`, `tile-grid`, `tile-source`).
- [ ] IMS 타일 렌더 end-to-end.
- [ ] PIMS 타일 인덱스 검증 + 렌더.
- [ ] pan/zoom 입력 처리 + clamp.
- [ ] LOD `best-available` + LRU 캐시.
- [ ] React wrapper + controlled/uncontrolled view state.
- [ ] 기본 벤치마크(타일 요청량, FPS, 메모리) 스크립트.

## 7. 리스크와 대응

- 브라우저별 ImageBitmap/색공간 차이: 디코드 옵션 고정 + 시각 회귀 테스트.
- 빠른 줌 시 요청 폭증: 타일 취소/디바운스 + 현재 줌 우선 스케줄.
- 텍스처 메모리 파편화: 텍스처 수명주기 명확화 + 정기 GC 포인트.
- 모바일 터치 제스처 충돌: passive 옵션/gesture state machine 분리.

## 8. 완료 정의 (v0)

- 1GB+급 WSI에서 타일 렌더, 드래그 팬, 줌이 기능적으로 안정 동작.
- LOD 전환 시 심한 깜빡임/빈 타일 현상 없음.
- React API로 외부 상태 제어 가능.
- 다음 단계(point overlay) 착수 가능한 binary data path 확보.
