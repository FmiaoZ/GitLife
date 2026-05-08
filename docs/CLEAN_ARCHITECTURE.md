# LIFE RPG Clean Architecture Guide

This refactor keeps behavior unchanged and reorganizes the codebase so new contributors can understand responsibilities faster.

## Current structure

- `index.html`
  - UI markup and styles
  - loads layers in this order:
    1. `src/domain/domain.js`
    2. `src/infrastructure/infrastructure.js`
    3. `src/application/application.js`
    4. `src/presentation/presentation.js`
- `src/domain/domain.js`
  - game dictionaries + pure domain helpers
- `src/infrastructure/infrastructure.js`
  - Supabase + local storage persistence
- `src/application/application.js`
  - state and use-case orchestration
- `src/presentation/presentation.js`
  - UI rendering, DOM interactions, bootstrap events

## Layer mapping

- **Domain layer** (`src/domain/domain.js`)
  - static domain models and dictionaries (`CLASS_DB`, `ITEMS_DB`, `ACHIEVEMENTS_DB`, etc.)
  - deterministic business helpers (`calcLv`, `defaultTags`, `defaultSkills`, `defaultEvents`, `rarLabel`)
- **Infrastructure layer** (`src/infrastructure/infrastructure.js`)
  - external persistence setup (`SUPABASE_URL`, `SUPABASE_KEY`, `db`)
  - local/cloud save and load (`saveLocal`, `loadLocal`, `save`, `profileToUser`)
- **Application layer** (`src/application/application.js`)
  - app state (`user`, `cloudUser`, `selectedClass`, `selectedMood`, `isDemo`)
  - use-case orchestration (register/login/logout, demo flow, create event, equip item)
- **Presentation layer** (`src/presentation/presentation.js`)
  - DOM rendering (`renderChar`, `renderMap`, `renderWorld`, `renderInv`)
  - interaction wiring (`openModal`, `switchTab`, click handlers, keydown handlers, notifications)

## Why this is cleaner

- The HTML no longer contains a very large embedded script block.
- Responsibilities are now physically split by architectural layer.
- New contributors can update one concern without scanning unrelated code.

## Behavior guarantee

- No user-facing flow, UI interaction, game rule, storage key, or API call was intentionally changed.
- This is a structural readability refactor, not a feature or logic rewrite.
