# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
