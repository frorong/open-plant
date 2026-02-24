# Open Plant WSI Docs

정적 문서 사이트입니다. GitHub Pages에서 `docs/` 디렉토리를 직접 배포합니다.

## Language Structure

- `index.html`: 언어 선택 랜딩 (`/en`, `/ko`)
- `en/`: English documentation
- `ko/`: 한국어 문서
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
