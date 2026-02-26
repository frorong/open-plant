# Point Hit Index & Tile Prefetch 성능 최적화 리포트

기준 데이터: 10,000,000 input points → ~9.2M after ROI clip

## 배경

WSI 뷰어에서 포인트 hover/click을 위한 공간 인덱스(`pointHitIndex`) 빌드가 메인 스레드에서 동기 실행되어
9M+ 포인트 기준 ~175ms UI 프리징 발생. React Strict Mode에서는 이중 실행되어 ~461ms 블로킹.
빠른 줌 시 타일 캐시 미스로 blank frame도 관찰됨.

## 변경 내역

### P0: pointHitIndex → Web Worker 이동

| 항목 | Before | After |
|---|---|---|
| 실행 위치 | 메인 스레드 (`useMemo`) | Web Worker (비동기 `useEffect`) |
| 메인 스레드 블로킹 | ~175ms | 0ms |
| Strict Mode 이중 실행 | 있음 (총 ~461ms) | 없음 (useEffect cleanup) |
| 자료구조 | `Map<number, Map<number, number[]>>` | flat typed arrays + open-addressing hash table |
| GC 압박 | 수십만 JS 객체 | TypedArray만 사용, GC-free |
| 워커→메인 전송 | N/A | ~48MB (index arrays only, positions/ids 미전송) |
| lookup 방식 | nested Map.get() 2단계 | `Int32Array` hash table O(1) |

#### 새 파일

- `src/workers/point-hit-index-worker.ts` — 워커 스크립트 (counting sort + flat hash)
- `src/wsi/point-hit-index-worker-protocol.ts` — 메시지 타입 정의
- `src/wsi/point-hit-index-worker-client.ts` — 메인 스레드 클라이언트, sync fallback 포함

#### 워커 알고리즘 (4-pass counting sort)

1. Pass 1: 각 포인트의 셀 좌표 계산 (`Int32Array`, GC 없음)
2. Pass 2: open-addressing hash로 유니크 셀 발견 + per-cell 카운팅
3. Pass 3: prefix sum으로 offset 계산
4. Pass 4: scatter로 `pointIndices` flat array 채우기
5. 최종 hash table 빌드 → transfer

### P1: 인접 tier 타일 prefetch

| 항목 | Before | After |
|---|---|---|
| 타일 fetch 전략 | 현재 tier만 reactive fetch | 현재 tier + 인접 tier (T±1) prefetch |
| blank frame | 발생 (tier 급변 시) | 대폭 감소 |

- `getVisibleTiles()` → `getVisibleTilesForTier(tier)` 추출
- `render()`에서 현재 tier 스케줄링 후, T±1 타일을 `distance2 += 1e6` 페널티로 합산 스케줄
- 이미 캐시된 타일은 prefetch에서 제외

## 측정 결과 (10M points, Chrome DevTools)

### v0 → v1 → v2 비교

| 지표 | v0 (원본) | v1 (워커 이동) | v2 (flat hash) |
|---|---|---|---|
| pointHitIndex 총 시간 | 461ms (175+286, 2회) | 398ms (1회) | 371ms (1회) |
| 메인 스레드 블로킹 | 175ms | 0ms | 0ms |
| rAF violation | 없음 | 111ms | 없음 |
| blank frame | 있음 | 없음 | 없음 |
| 워커→메인 전송량 | N/A | ~120MB | ~48MB |

### v2 371ms 내부 구성 추정

- ~30ms: 메인 스레드 `.slice()` 72MB (positions 복사)
- ~250ms: 워커 내 counting sort (9M 포인트, ~500K 셀)
- ~50ms: 워커 내 hash table 빌드
- ~40ms: postMessage + typed array view 생성

전체가 off-main-thread이며, 메인 스레드 비용은 `.slice()` ~30ms뿐.

## 한계 및 추가 최적화 여지

- `.slice()` 제거: `SharedArrayBuffer` 도입 시 zero-copy 가능 (CORS 헤더 필요)
- 워커 알고리즘 WASM 교체: counting sort를 Rust/C로 포팅 시 ~2x 추가 개선 기대
- incremental index: 포인트 변경 시 전체 rebuild 대신 delta update
