# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Camera rotation support in `WsiViewState` via `rotationDeg`.
- `Ctrl/Cmd + drag` rotation input path with configurable renderer option.
- `rotationResetNonce` and `ctrlDragRotate` props on `WsiViewerCanvas`.
- World-coordinate pointer stream callback: `onPointerWorldMove`.
- Region style resolver API: `resolveRegionStrokeStyle`.
- Custom overlay shape API for patch/dashed guides: `overlayShapes`.
- Fixed-pixel stamp tool: `stamp-rectangle-4096px` and `stampOptions.rectanglePixelSize`.
- ROI term-group utility and callback path: `computeRoiPointGroups`, `onRoiPointGroups`.

### Changed
- `WsiTileRenderer` projection, bounds, and zoom anchoring now account for rotation.
- Overview map viewport indicator now supports rotated viewport polygon rendering.
- Region active selection now toggles on same-region click and switches on different region click.

### Docs
- Updated EN/KO API and guides for rotation, pointer world callbacks, overlay shapes, 4096px stamp, and ROI term stats.
- Updated `todo.md` gap table with current support status and code-path references.

## [0.1.0] - 2026-02-24

### Added
- WebGL2-based React WSI viewer core with tile rendering, drag pan, and zoom interactions.
- High-volume cell point rendering pipeline with Zstd MVT parsing support.
- Draw/region tools: freehand, rectangle, and circular region creation.
- Stamp tools for circle and rectangle with externally configurable size options.
- Region label rendering with top placement and customizable style options.
- Example app and bilingual (`docs/en`, `docs/ko`) documentation structure.

### Changed
- Region styling API expanded with `hover` and `active` stroke states.
- Region interaction API expanded with `onHover` and `onClick` listeners.
- npm package build/publish setup finalized for ESM/CJS/types outputs.

### Docs
- Added engine roadmap documentation for moving from viewer library to render engine.
