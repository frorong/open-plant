# Open Plant 엔진 제작 과정

이 문서는 Open Plant가 어떤 설계 판단을 거쳐, WSI(Viewer) 라이브러리에서 렌더 엔진 형태로 발전했는지 기록한다.
목표는 "왜 이렇게 만들었는지"를 신규 기여자가 문서만 보고 파악할 수 있게 하는 것이다.

## 1) 출발점: 범용 레이어가 아닌 WSI 전용 런타임

초기 요구사항은 명확했다.

- 병리 WSI 타일 렌더링이 1순위
- 대용량 cell point를 즉시 렌더링
- 인터랙션(팬/줌/회전/드로우) 충돌 제거
- 불필요한 범용 기능 제거
- WebGPU는 "렌더 대체"가 아니라 "연산 가속"에 우선 적용

핵심 결정은 `deck.gl` 의존 구조를 유지하지 않고, `canvas + WebGL2` 기반 런타임을 직접 구축하는 것이었다.

## 2) 아키텍처 분리 원칙

엔진은 처음부터 두 캔버스로 분리했다.

- WebGL 캔버스: 타일 + 포인트 렌더링 (`WsiTileRenderer`)
- 2D 캔버스: 드로우/ROI 오버레이 (`DrawLayer`)

이 분리로 얻은 장점:

- 드로우 중 팬/줌 동시 발화 방지 (`pointer capture` + `interactionLock`)
- 타일/포인트 렌더 루프의 단순화
- ROI 미리보기/라벨/커스텀 도형을 GPU 파이프라인과 독립적으로 제어

## 3) 단계별 구현 히스토리

### Phase A - M1 기반 구축 (0.1.0, 2026-02-24)

먼저 "보이는 것부터" 완성했다.

1. WSI 타일 파이프라인 구축
   - 멀티 tier 선택
   - 뷰포트 교차 타일 계산
   - 비동기 fetch + texture upload
   - 타일 캐시/스케줄링
2. 기본 인터랙션
   - drag pan / wheel zoom
3. 포인트 파이프라인
   - `Float32Array positions` + `Uint16Array paletteIndices` 계약 확정
4. ROI 드로우 도구
   - freehand / rectangle / circular
5. 문서/예제 동시 제공
   - docs EN/KO, example 앱

### Phase B - 런타임 안정화/고도화 (1.2.x, 2026-02-25)

실사용 이슈를 반영하며 엔진 성격을 강화했다.

1. 카메라 회전 도입
   - `rotationDeg`
   - `Ctrl/Cmd + drag` 회전 입력 경로
   - 회전 reset path
2. 타일 렌더 안정성
   - fallback tile 2-pass 렌더
   - context loss/restore 대응
3. ROI/Region 상호작용
   - hover/active stroke 스타일 분리
   - 클릭 토글/해제 정책 정리
4. 포인트 클리핑 가속
   - `sync` / `worker` / `hybrid-webgpu`
   - `drawIndices` 브리지로 draw pass 결합
5. 배포 품질 게이트
   - `release:gate` 고정
   - unit/perf/e2e smoke 자동 검증

### Phase C - Patch/확장성 정리 (1.2.2, 2026-02-25)

엔진을 "호스트 앱이 조립 가능한 형태"로 확장했다.

1. 4096 스탬프 의도 분리
   - `stamp-rectangle-4096px`는 ROI가 아니라 patch intent
   - `onPatchComplete` 도입
2. Patch 전용 오버레이 채널
   - `patchRegions`, `patchStrokeStyle`
3. 커스텀 레이어 슬롯
   - `customLayers`
   - `worldToScreen`, `screenToWorld`, `requestRedraw` 컨텍스트 제공
4. JSON export primitive
   - `filterPointIndicesByPolygons`
   - `filterPointIndicesByPolygonsInWorker`

## 4) 핵심 기술 선택과 이유

### 4.1 WebGL2 유지

- 브라우저/디바이스 호환성이 높고, 운영 리스크가 낮다.
- 타일/포인트 렌더를 안정적으로 단일 루프에 묶기 좋다.

### 4.2 TypedArray 중심 데이터 계약

- 객체 배열 대신 연속 메모리 버퍼를 표준 입력으로 고정
- GC pressure 감소
- 워커/연산 경로로 전달이 쉬움

### 4.3 Worker 우선, WebGPU 선택적 가속

- 기본값은 worker 모드로 안전하게 유지
- WebGPU는 bbox prefilter 같은 연산 가속에 우선 적용
- 성능 이득이 확실할 때만 확장

### 4.4 렌더 루프 단순화

- tile pass -> point pass 순으로 고정
- overlay/draw는 별도 캔버스로 분리
- 디버깅/회귀 추적이 쉬운 구조

## 5) 개발 중 반복적으로 해결한 문제

- 줌 전환 시 블랭크/깜빡임
  - fallback 타일 우선 렌더로 완화
- 회전 경계각(±180도) 처리
  - 각도 누적/정규화 로직 정리
- 드로우 vs 팬 이벤트 충돌
  - pointer capture + interaction lock으로 구조적으로 분리
- 워커 번들 경로/패키징 회귀
  - 라이브러리 빌드의 worker URL 상대경로 보정

## 6) 현재 엔진 상태 (1.2.2 기준)

아래 조건은 이미 충족된 상태다.

- WSI 타일 렌더링/캐시/스케줄링 내장
- 수백만~천만 단위 포인트 렌더 경로 운영
- ROI/patch/커스텀 레이어 조합 가능
- worker/hybrid-webgpu 클리핑 지원
- release gate 기반 배포 검증 체계 확립
- EN/KO 문서/예제 동시 유지

즉, 현재 Open Plant는 "단순 viewer wrapper"가 아니라,
호스트 앱이 조립 가능한 형태의 WSI 렌더 엔진 단계에 들어왔다고 볼 수 있다.

## 7) 다음에 강화할 영역

1. 모바일 장치별(특히 iOS) 실측 성능 리포트 자동화
2. WebGPU compute -> draw bridge 범위 확대
3. ROI/patch export 파이프라인 표준 포맷 템플릿 제공
4. 문서의 "성능 주장"을 재현 가능한 측정 프로토콜로 고정
