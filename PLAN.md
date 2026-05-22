# Confession Cathedral — Build Plan

## Overview
A single-page React app where users post anonymous confessions. No backend, no auth, no persistence — all state lives in memory.

---

## 1. Project Scaffold

- **Stack:** React + Vite (TypeScript), plain CSS
- **Init:** `npm create vite@latest confession-cathedral -- --template react-ts`
- **Structure:**

```
confession-cathedral/
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── components/
│   │   ├── ConfessionForm.tsx
│   │   ├── ConfessionForm.css
│   │   ├── ConfessionFeed.tsx
│   │   ├── ConfessionFeed.css
│   │   ├── ConfessionCard.tsx
│   │   └── ConfessionCard.css
│   ├── types.ts
│   └── hooks/
│       └── useConfessions.ts
├── public/
└── package.json
```

---

## 2. Types (`src/types.ts`)

```ts
export interface Confession {
  id: number;
  text: string;
  timestamp: Date;
}
```

---

## 3. Custom Hook (`src/hooks/useConfessions.ts`)

- Manages `Confession[]` in `useState`
- Exposes: `confessions`, `addConfession(text: string): boolean`
- `addConfession` rejects empty/whitespace-only strings
- Returns `false` on rejection, `true` on success
- Sorts newest-first internally (or feed component sorts)

---

## 4. Components

### App.tsx
- Wraps `<ConfessionForm />` + `<ConfessionFeed />`
- Passes `addConfession` down to form, `confessions` to feed

### ConfessionForm.tsx
- `<textarea>` with `maxLength={280}`
- Live character counter — turns **red** at 280
- Submit button — disabled when empty or over limit
- Calls `addConfession` on submit; resets textarea on success
- Shows inline validation message for empty submissions

### ConfessionFeed.tsx
- Receives `confessions` array
- Renders `<ConfessionCard />` for each, newest first
- Passes `index` as key for animation

### ConfessionCard.tsx
- Displays confession text + human-readable time (`"2m ago"`, `"1h ago"`)
- Uses CSS `@keyframes fadeIn` (opacity 0→1, translateY 10px→0)
- No Framer Motion dependency — keep it light with plain CSS

---

## 5. CSS Approach

- Plain CSS files co-located with components
- Global reset + dark "cathedral" theme in `index.css`
- `@keyframes fadeIn` in `ConfessionCard.css`
- Responsive: max-width container, single-column mobile

---

## 6. Vibe / Theme

- Dark background (#0a0a0f)
- Muted gold/amber accents (#c9a85e, #f5e6b8)
- Serif font for confession text, sans-serif for UI
- Subtle box-shadow on cards, rounded corners
- Minimal, quiet, reverent — like a real confessional

---

## 7. Edge Cases

| Case | Handling |
|------|----------|
| Empty / whitespace-only | Rejected by `addConfession`, form shows message |
| Over 280 chars | `maxLength` on textarea prevents typing further |
| Rapid submit | Form disabled during submit, no duplicate entries |
| Very long single word | CSS `word-break: break-word` on card text |
| No confessions yet | Feed shows empty state: "No confessions yet. Be the first." |

---

## 8. Order of Implementation

1. Scaffold with Vite (`react-ts` template), clean boilerplate
2. `src/types.ts`
3. `src/hooks/useConfessions.ts`
4. `ConfessionCard.tsx` + CSS (leaf component first)
5. `ConfessionFeed.tsx` + CSS
6. `ConfessionForm.tsx` + CSS
7. `App.tsx` + `App.css` (wire everything)
8. `index.css` — global reset, theme variables, typography
9. Polish: responsive, empty state, animations

---

## 9. Verification

- `npm run dev` — app loads, form works, feed updates
- Empty submit shows message, no console errors
- Character counter works, turns red at 280
- Cards fade in on render
- No network requests, no localStorage, no backend calls
