# Open Plant WSI Docs

정적 문서 사이트입니다. GitHub Pages에서 `docs/` 디렉토리를 직접 배포합니다.

## Language Structure

- `index.html`: 언어 선택 랜딩 (`/en`, `/ko`)
- `en/`: English documentation
- `ko/`: 한국어 문서
- `en/migration-guide.html`, `ko/migration-guide.html`: API 수명주기/마이그레이션 기준
- `en/contributing.html`, `ko/contributing.html`: 오픈소스 기여 워크플로우/품질 게이트
- `assets/site.css`: 공통 스타일
- `assets/site.js`: 공통 스크립트

## Local Preview

```bash
cd docs
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173` 접속.

## Deploy

- 워크플로우: `.github/workflows/docs-pages.yml`
- GitHub Settings > Pages > Source를 `GitHub Actions`로 설정

## Release Gate

- 워크플로우: `.github/workflows/release-gate.yml`
- 로컬 검증: `npm run release:gate` (`typecheck` + `test:ws9` + `build:lib`)
- publish 훅: `prepublishOnly`에서 release gate 강제 실행
