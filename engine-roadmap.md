# WSI Viewer Engine Roadmap

## 1. 목적

- 현재 라이브러리를 "컴포넌트 모음"에서 "렌더 엔진"으로 승격한다.
- 목표는 다음 3가지를 동시에 만족하는 것:
- 성능: 대용량 타일/포인트에서 프레임 드롭 없이 동작.
- 안정성: 컨텍스트 손실, 네트워크 지연, 대용량 메모리 압박에서 복구 가능.
- 확장성: React 외 런타임에서도 재사용 가능한 코어 API 구조.

## 2. 엔진의 정의 (완료 기준)

아래를 만족하면 엔진으로 판단한다.

- `core`와 `react` 계층이 분리되어, React 없이도 동일 렌더 기능을 사용 가능.
- 렌더 루프, 타일 스케줄러, 포인트 파이프라인이 모듈화되어 교체/확장 가능.
- 성능 예산과 회귀 테스트(자동화)가 존재.
- 런타임 장애(WebGL context lost, 네트워크 실패)에서 복구 로직이 존재.
- API 안정성 정책(semantic versioning + deprecated lifecycle)이 문서화됨.

## 3. 현재 상태 요약

- 강점:
- WebGL2 기반 타일 + 포인트 통합 렌더 루프가 이미 존재.
- ROI 드로우/스탬프/클리핑 기능이 라이브러리 레벨로 통합됨.
- 문서/예제가 빠르게 검증 가능하도록 정리됨.
- 주요 갭:
- 패키징이 엔진 배포 모드가 아님(`private`, app build 중심).
- 대용량 포인트 경로가 전량 드로우 기반(가시영역/LOD/인덱스 부족).
- ROI 클리핑이 메인 스레드 CPU 경로 중심.
- WebGPU compute 경로는 설계만 있고 구현이 없음.

## 4. 핵심 용어

- `mpp`:
- microns per pixel.
- 네이티브 피라미드 레벨(`maxTierZoom`) 기준 1픽셀의 실제 길이(um).
- 스탬프 mm^2 면적 -> 픽셀 크기 변환의 기준 값.

## 5. 워크스트림

### WS-1. 패키지 구조/배포 체계

- 목표:
- 엔진 코어를 독립 배포 가능하게 정리.
- 작업:
- `core-engine`(렌더/스케줄러/데이터 파이프라인)와 `react-bindings` 분리.
- 라이브러리 빌드 모드(ESM + 타입 선언 + exports map)로 전환.
- `peerDependencies` 정리(react/react-dom는 binding 패키지로 제한).
- 산출물:
- 엔진 단독 import 예제.
- React 바인딩 import 예제.
- 완료 기준:
- React 없는 환경에서 엔진 코어로 타일/포인트 렌더 가능.

### WS-2. 타입 안정성/코어 정리

- 목표:
- 유지보수 가능한 엔진 코드베이스 확보.
- 작업:
- `@ts-nocheck` 제거.
- `camera`, `gl utils`, `types` 중복 제거.
- 렌더러 내부 상태를 명시 타입으로 고정.
- 에러 코드 표준화(예: `ENGINE_GL_CONTEXT_LOST`, `ENGINE_TILE_FETCH_FAIL`).
- 완료 기준:
- 엔진 경로 strict typecheck 통과.

### WS-3. 타일 서브시스템

- 목표:
- 빈 타일/중복 드로우/과도한 fetch를 제거.
- 작업:
- 타일 스케줄러 도입:
- 우선순위(뷰 중심 거리).
- 동시성 제한(예: 8~16).
- 시야 이탈 요청 abort.
- 재시도/백오프 정책.
- fallback 렌더 중복 제거(동일 tier+xy 중복 draw 방지).
- texture cache 정책 LRU + 메모리 상한(MB 기준) 도입.
- 완료 기준:
- 빠른 zoom/pan 중 깜빡임 없이 안정 동작.
- inflight 폭주 없음(상한 유지).

### WS-4. 포인트 서브시스템

- 목표:
- 대용량(수백만) 포인트에서도 인터랙션 유지.
- 작업:
- 공간 인덱스(그리드/타일 인덱스) 도입 후 가시영역 포인트만 draw.
- LOD 샘플링(저배율에서 downsample) 도입.
- 포인트 반경/스타일 매핑을 테이블 기반으로 통일.
- 메모리 풀(버퍼 재사용)로 GC 스파이크 제거.
- 완료 기준:
- 기준 데이터셋에서 저배율/중배율에서 프레임 유지.

### WS-5. ROI/드로우 파이프라인

- 목표:
- 드로잉과 분석이 성능 병목 없이 결합.
- 작업:
- ROI hit-test 가속(BBox + 공간 인덱스).
- ROI 포인트 클리핑을 Worker 기반으로 분리.
- ROI 변경분만 부분 재계산(incremental).
- 완료 기준:
- ROI 추가/수정 시 전체 프리즈 없이 반응.

### WS-6. WebGPU compute 경로

- 목표:
- 계산-heavy 작업을 GPU로 오프로드.
- 1차 대상:
- 포인트 in-polygon 판정.
- 저배율 density aggregation.
- 작업:
- WebGPU capability check + fallback(WebGL/CPU).
- compute output을 WebGL draw buffer로 브리지.
- 완료 기준:
- WebGPU 사용 가능 환경에서 CPU 대비 처리시간 유의미 개선.

### WS-7. 안정성/복구

- 목표:
- 실제 운영 환경에서 죽지 않는 엔진.
- 작업:
- context lost/restored 핸들링.
- 네트워크 오류 시 degrade 전략(placeholder/fallback tier 유지).
- 리소스 해제 누수 검사(texture/buffer/program).
- 완료 기준:
- 장애 시 재시작 없이 복구 가능.

### WS-8. 관측성/디버그

- 목표:
- 성능/장애 원인 추적 가능.
- 작업:
- 프레임 지표: fps, cpu ms, gpu ms(가능 시), draw calls.
- 타일 지표: cache hit, inflight, retry, fail.
- 포인트 지표: visible count, sampled count, clip time.
- debug overlay + 이벤트 훅 제공.
- 완료 기준:
- 운영 로그만으로 병목 구간 식별 가능.

### WS-9. 테스트/벤치마크

- 목표:
- 회귀를 막는 자동화.
- 작업:
- 유닛: 좌표변환, tile index, clip correctness.
- E2E: pan/zoom/draw/stamp/overview interaction.
- 성능 벤치:
- 타일 전환 지연.
- 100만/500만 포인트 렌더.
- ROI 100개 hit-test.
- 완료 기준:
- PR 단계에서 성능 budget regression 감지.

### WS-10. 문서/DX

- 목표:
- 문서만으로 팀이 구현/확장 가능.
- 작업:
- 아키텍처 다이어그램(렌더/스케줄/데이터 경로).
- `mpp`, `zoom`, `tier` 변환식 명시.
- API reference에 default/제약/복구 동작 모두 명시.
- 확장 가이드(커스텀 tile source, 커스텀 point shader, worker adapter).
- 완료 기준:
- 신규 개발자가 문서만 보고 feature 1개 구현 가능.

## 6. 단계별 실행 계획

### Phase 0 (1주) - 기반 정리

- 배포 구조 설계 확정.
- 타입/모듈 경계 정리 초안.
- 성능 예산 수치 확정.

### Phase 1 (2~3주) - 엔진 골격

- 패키지 분리 + 라이브러리 빌드 전환.
- 타일 스케줄러 1차 적용.
- context lost 복구 골격 추가.

### Phase 2 (2~3주) - 대용량 성능

- 포인트 가시영역 컷 + LOD 적용.
- ROI 클리핑 Worker 경로 적용.
- 벤치 자동화(최소 3 시나리오) 도입.

### Phase 3 (2주) - WebGPU compute 1차

- compute 모듈 실험 구현 + fallback 포함.
- 병리 데이터셋 기준 효과 검증.

### Phase 4 (1주) - 문서/릴리스

- API 안정성 정책/마이그레이션 가이드 작성.
- v1 엔진 릴리스 체크리스트 완료.

## 7. 성능 예산(초안)

- 4K 뷰포트 기준:
- pan/zoom 인터랙션: p95 프레임 시간 16.7ms 이하 목표.
- 타일 전환 빈 프레임: 0 (fallback 보장).
- 100만 포인트: 중배율에서 인터랙션 지속 가능.
- ROI 50개 추가 시 UI freeze 체감 없음.

## 8. 당장 시작할 구현 순서 (현재 저장소 기준)

1. `src/wsi/wsi-tile-renderer.ts` 타입화 + 스케줄러 분리:
- `src/wsi/tile-scheduler.ts` 신규.
2. 포인트 경로 분리:
- `src/wsi/point-pipeline.ts` 신규(visible cut/LOD).
3. ROI 클립 Worker화:
- `src/workers/roi-clip-worker.ts` + adapter.
4. 패키징:
- 라이브러리 빌드 설정, exports map, public API 고정.
5. 문서:
- `docs/en|ko`에 "Engine Architecture" 섹션 추가.

## 9. 릴리스 게이트

- `typecheck`, `unit`, `e2e`, `perf benchmark` 모두 통과.
- 메모리/리소스 누수 체크 통과.
- API 문서 + 마이그레이션 가이드 동시 배포.
- Known limitations 명시.

