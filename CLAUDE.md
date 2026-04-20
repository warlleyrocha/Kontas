# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Expo dev server (required for native plugins)
npm run android      # Run on Android emulator
npm run ios          # Run on iOS simulator

# Code quality
npm run lint         # ESLint via Expo
npm run lint:biome   # Biome linter check
npm run fix:biome    # Auto-fix Biome issues
npm run format       # Biome formatter

# Testing
npm test                        # Jest in watch mode
npx jest --testPathPattern="FeatureName" --no-coverage  # Run a single test file/folder
npm run test:coverage           # Generate coverage report
```

## Architecture

### Feature modules (`src/features/<domain>/`)

Each domain (auth, republic, residents, invites, accounts, legal, user) is self-contained:

```
features/<domain>/
├── screens/       # Full-screen components
├── components/    # Domain-specific UI
├── hooks/         # Custom hooks — queries, mutations, form logic, screen logic
├── services/      # API calls (axios via shared client)
├── types/         # TypeScript types for this domain
├── utils/         # Pure helpers, formatters
└── constants/     # Domain constants
```

### Data fetching pattern (React Query)

- Query keys defined in `hooks/*.keys.ts` using factory functions (e.g. `accountKeys.byRepublic(id)`)
- Queries and mutations live in `hooks/use<Domain>Queries.ts`
- Screen-level orchestration lives in `hooks/use<Screen>Tab.ts` or `hooks/use<Screen>Screen.ts`
- Cache invalidation happens inside mutation `onSuccess` callbacks
- `staleTime` is 60 seconds globally; `RetryLogic` skips circuit-breaker and canceled errors

### API / service layer

- Single Axios instance in `src/services/api.ts`
  - Injects Bearer token from Expo SecureStore on every request
  - Custom circuit breaker: opens after 3 consecutive 408/429/5xx failures, half-open after 10 s
  - 10-second timeout
- Errors normalized via `AppError` in `src/services/httpError.ts`; use `getErrorMessage(error, fallback)` in catch blocks
- Environment base URL read from `EXPO_PUBLIC_API_URL` (EAS for builds, `.env` for local dev)

### Styling

NativeWind (Tailwind CSS) — use className strings directly on RN primitives. Custom tokens:
- Colors: `teal`, `teal-dark`, `brand.orange`
- Fonts: Inter + Mulish (loaded via `src/lib/fonts.ts`)

### Navigation (Expo Router)

File-based routing under `src/app/`. Key route groups:
- `(auth)` — login, onboarding
- `(republics)/[id]` — main republic dashboard (Accounts / Residents / Summary tabs)
- `(republics)/[id]/payments` — admin-only payment confirmation screen
- `(userProfile)` — profile, invite management

### State management

- **Server state** — React Query exclusively; no Redux or Zustand
- **Local UI state** — `useState` / `useReducer` inside custom hooks, never in screen components directly
- **Blocking async operations** — `useRef<Record<string, boolean>>` for in-flight guards + mirrored `useState` for observable state (see `usePayments.ts`)
- **Global refresh** — `RefreshContext` with `registerRefresh(key, fn)` / `refreshAll()`

### Testing conventions

- Test files go in `__test__/` next to the file under test
- Wrap hooks needing React Query with a `QueryClientProvider` wrapper in `renderHook`
- Mock module-level dependencies with `jest.mock(...)` at file scope
- Use `jest.mocked(fn).mockReturnValue(...)` after `jest.mock` for typed overrides
- `isConfirming` / `isRefusing` and similar loading states are **props** on leaf card components, derived from hook-level dictionaries (`Record<string, boolean>`) — not internal component state
- The `useRef` + mirrored `useState` pattern (ref for blocking, state for observability) avoids stale closure issues in `useCallback` dependencies
