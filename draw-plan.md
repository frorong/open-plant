# Draw Plan (Freehand / Rectangle / Circular)

## 1. 목표

- 예시 뷰어에 ROI 드로잉 도구 추가.
- 도구 종류: `Freehand`, `Rectangle`, `Circular`.
- 드로잉 모드가 활성화되면 map drag pan/zoom 인터랙션을 중지하고 드로잉만 수행.
- 드로잉 중 궤적/미리보기를 즉시 화면에 표시.
- 완료 시 시작점-끝점을 닫은 `coordinates[]`를 반환.

## 2. 범위 (v1)

- 포함:
- 툴바 버튼 3개(`Freehand`, `Rectangle`, `Circular`) + `Cursor`(기본 모드).
- pointer 기반 드로잉 이벤트 처리.
- 미리보기 렌더(overlay).
- 결과 콜백(`onDrawComplete`)으로 닫힌 좌표 배열 반환.
- 제외:
- 편집/삭제/다중 선택.
- 서버 저장, WKT 변환, undo/redo.

## 3. 상태 모델

- `drawTool: "cursor" | "freehand" | "rectangle" | "circular"`
- `isDrawing: boolean`
- `startPoint: [x, y] | null`
- `currentPoint: [x, y] | null`
- `drawingCoords: [x, y][]`
- `previewCoords: [x, y][]`

## 4. 인터랙션 규칙

- `drawTool === cursor`
- 기존 pan/zoom 인터랙션 유지.
- `drawTool !== cursor`
- pan drag 비활성화.
- wheel zoom 비활성화.
- canvas cursor = crosshair.
- `pointerdown`
- 드로잉 시작.
- `startPoint/currentPoint` 설정.
- freehand면 `drawingCoords = [start]`.
- `pointermove`
- freehand: 좌표 append(너무 촘촘한 샘플은 거리 threshold로 스킵).
- rectangle/circular: `currentPoint` 갱신 + preview 생성.
- `pointerup`
- freehand: 누적 궤적으로 폴리곤 생성.
- rectangle: 대각선 2점으로 사각형 생성.
- circular: 시작점-현재점으로 외접 사각형 기반 원(다각형) 생성.
- 생성 좌표를 닫아서 반환.

## 5. 좌표 생성 규칙

- `closeRing(coords)`
- 첫 점과 마지막 점이 다르면 마지막에 첫 점 추가.
- freehand:
- 최소 3점 미만이면 폐기.
- rectangle:
- `[x0,y0] -> [x1,y0] -> [x1,y1] -> [x0,y1] -> [x0,y0]`.
- circular:
- center = `(start + end) / 2`
- radius = `distance(start, end) / 2`
- sides = 64~128 고정
- 원 다각형 좌표 생성 후 closeRing.

## 6. 결과 반환 계약

- 콜백:
- `onDrawComplete(payload)`
- payload:
- `tool: "freehand" | "rectangle" | "circular"`
- `coordinates: [number, number][]` (닫힌 ring)
- `bbox: [minX, minY, maxX, maxY]`
- `areaPx?: number`

## 7. 렌더링 방식 (고성능)

- deck 레이어 의존 없이 `overlay 2D canvas` 사용.
- 이유:
- 구현 단순성.
- draw 미리보기 재렌더 비용 최소.
- 기존 WebGL tile/point 렌더러와 충돌 최소.
- 표시 항목:
- freehand: path + 반투명 fill.
- rectangle/circular: preview polygon.

## 8. 기존 뷰어와 결합 포인트

- `WsiTileRenderer`에 `interactionLock` 도입.
- `interactionLock = true`면 pointer pan/wheel/dblclick 무시.
- React 상위에서 `drawTool !== cursor`일 때 lock 전달.
- overlay가 pointer 이벤트를 받아 draw 상태를 갱신.

## 9. 툴바 변경 (example)

- 기존 상단 툴바에 Draw 섹션 추가:
- `Cursor`
- `Freehand`
- `Rectangle`
- `Circular`
- 활성 버튼 하이라이트 표시.
- draw 완료 후 기본 동작:
- 옵션 A: cursor로 자동 복귀.
- 옵션 B: 같은 툴 유지.
- v1 기본: 자동 cursor 복귀.

## 10. 에러/예외 처리

- 좌표 부족(점/선 수준)인 경우 결과 emit 안 함.
- 너무 작은 도형(면적/반지름 임계값 이하)은 폐기.
- pointercancel 발생 시 세션 취소.
- ESC 키로 현재 드로잉 취소.

## 11. 구현 단계

- 1단계: Draw 상태/툴바/interaction lock 연결.
- 2단계: freehand 이벤트 + 궤적 오버레이.
- 3단계: rectangle/circular preview + 완료 좌표 생성.
- 4단계: onDrawComplete payload 확정 + 콘솔 검증.
- 5단계: 샘플 좌표를 화면에 다시 그려 정확성 확인.

## 12. 완료 기준

- draw 모드에서 pan이 발생하지 않음.
- freehand 궤적이 드로잉 중 실시간으로 보임.
- rectangle/circular preview가 드래그 중 즉시 반영됨.
- mouse up 시 닫힌 `coordinates[]`가 정확히 반환됨.
- zoom/pan 재활성화가 cursor 모드에서 정상 동작.
