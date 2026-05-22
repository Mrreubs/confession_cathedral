# Software Engineering Principles in Confession Cathedral

Each principle below includes a plain-language definition and the exact file:line where it appears.

---

## 1. Controlled Components

**Definition:** React owns the value of an input field, not the browser. The input always displays whatever the state variable holds, and every keystroke goes through React's `onChange` handler before anything appears. This gives the code complete control over validation, formatting, and clearing.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/components/ConfessionForm.tsx` | 11, 39, 40-43 | `const [text, setText] = useState('')` creates the state. `value={text}` ties the textarea to that state. `onChange` calls `setText(e.target.value)` on every keystroke. |
| `src/components/ConfessionForm.tsx` | 27, 47-49 | `setText('')` on submit clears the textarea instantly. `remaining` (line 15) recalculates from `text.length` and drives the char counter. |
| `src/components/ConfessionForm.tsx` | 56 | `disabled={text.trim().length === 0}` reads the controlled state to decide whether the button is clickable. |

---

## 2. Immutability

**Definition:** Never modify existing data. Instead, create a brand-new copy with the changes. This lets React detect differences by simple reference comparison (old array !== new array) and prevents subtle bugs where two parts of the code share the same object.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/hooks/useConfessions.ts` | 17 | `setConfessions((prev) => [newConfession, ...prev])` — the spread operator `...prev` creates a new array containing all old items plus the new one at the front. The old array is never touched. |
| `src/hooks/useConfessions.ts` | 8 | `text.trim()` returns a new string; the original string stays unchanged. Strings are immutable in JavaScript. |

---

## 3. Lifting State Up

**Definition:** Move shared state to the closest common ancestor of every component that needs it, then pass it down via props. This keeps state in one source of truth instead of duplicating it across sibling components.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/App.tsx` | 7 | `const { confessions, addConfession } = useConfessions()` — state lives in `App`, the common parent of both `ConfessionForm` and `ConfessionFeed`. |
| `src/App.tsx` | 16 | `<ConfessionForm onAddConfession={addConfession} />` — passes the add function **down** to the form. |
| `src/App.tsx` | 17 | `<ConfessionFeed confessions={confessions} />` — passes the data **down** to the feed. |

---

## 4. Props Down, Events Up (Unidirectional Data Flow)

**Definition:** Data flows one way — parent to child via props. Children never modify parent state directly. Instead, they call a function (an event) that the parent provided, and the parent updates state.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/App.tsx` | 16 | `addConfession` flows **down** as a `onAddConfession` prop. |
| `src/components/ConfessionForm.tsx` | 7, 20 | The form receives `onAddConfession` as a prop and **calls it up** when submitted: `onAddConfession(text)`. The form never calls `setConfessions` directly. |
| `src/components/ConfessionFeed.tsx` | 6, 20-21 | `confessions` flows **down** as a prop. The feed only reads data; it never writes. |

---

## 5. Separation of Concerns

**Definition:** Each file has one job and doesn't mix responsibilities. Type definitions, state logic, rendering, and styling are split into separate files.

**Files & Lines:**

| File | Responsibility |
|------|---------------|
| `src/types.ts` | Data shape — defines what a Confession looks like. |
| `src/hooks/useConfessions.ts` | State logic — manages the confession list and the add function. |
| `src/components/ConfessionForm.tsx` | Input — handles typing, validation, and submission. |
| `src/components/ConfessionFeed.tsx` | Display — renders the list and handles the empty state. |
| `src/components/ConfessionCard.tsx` | Display — renders a single confession and computes "time ago." |
| `src/App.tsx` | Orchestration — wires the hook, form, and feed together. |
| `src/main.tsx` | Entry point — mounts React into the HTML page. |
| `index.html` | Shell — the bare HTML page that hosts everything. |
| `*.css` files | Styling — every component has its own CSS file co-located next to it. |

---

## 6. Encapsulation (Information Hiding)

**Definition:** Each piece of code hides its internal details and only exposes a minimal, predictable interface. Other code interacts through that interface without knowing how things work inside.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/hooks/useConfessions.ts` | 21 | Only exposes `{ confessions, addConfession }`. The `useState` call and the `trim` logic are hidden. Callers don't know or care about `setConfessions` or `prev`. |
| `src/components/ConfessionCard.tsx` | 4 | `timeAgo` is a module-private function — only `ConfessionCard` can use it. Other files never see it. |
| `src/components/ConfessionForm.tsx` | 11-13, 17 | `text`, `error`, `textareaRef`, and `handleSubmit` are all local to the component. No parent can reach in and mess with them. |

---

## 7. Composition

**Definition:** Build complex UIs by nesting simple, reusable components. Each component does one small thing, and you combine them like LEGO bricks.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/App.tsx` | 16-17 | `<ConfessionForm>` + `<ConfessionFeed>` — App composes two independent pieces. |
| `src/components/ConfessionFeed.tsx` | 21 | `<ConfessionCard>` — the feed composes individual cards inside itself. |
| `src/main.tsx` | 8 | `<App />` wrapped in `<StrictMode>` — even the entry point uses composition. |

---

## 8. Single Responsibility Principle

**Definition:** Every module, class, or function should have exactly one reason to change. It should do one thing and do it well.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/hooks/useConfessions.ts` | 4-22 | **One job:** manage the confessions list. If validation rules change, this is the only file to edit. |
| `src/components/ConfessionCard.tsx` | 4-13 | `timeAgo` does exactly one thing: convert a Date to a human-readable string. |
| `src/components/ConfessionCard.tsx` | 19-25 | The component does exactly one thing: render a single confession card. |
| `src/components/ConfessionForm.tsx` | 10-61 | Does one thing: handle user input and submission. |
| `src/components/ConfessionFeed.tsx` | 9-24 | Does one thing: render the list (or the empty state). |

---

## 9. Declarative Programming

**Definition:** You describe **what** the UI should look like for a given state, not **how** to get there from the previous state. React handles the "how" (comparing old and new, updating the DOM).

**Files & Lines:**

| File | Lines | Examples |
|------|-------|----------|
| `src/components/ConfessionFeed.tsx` | 10-24 | "If confessions is empty, show this message. Otherwise, map over each one and render a card." — a description of the desired outcome for each state. |
| `src/components/ConfessionForm.tsx` | 46-50 | "The char counter should show `remaining`. If it's 0 or less, add the `over` class." |
| `src/components/ConfessionForm.tsx` | 52 | `{error && <p>...</p>}` — "If error is truthy, render the paragraph." |
| `src/components/ConfessionForm.tsx` | 53-59 | `disabled={text.trim().length === 0}` — "The button is disabled if there's no text." |

---

## 10. Custom Hook Encapsulation

**Definition:** Extract reusable stateful logic into a function (a hook) so components stay focused on rendering instead of managing state infrastructure.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/hooks/useConfessions.ts` | 4-22 | All `useState`, `useCallback`, and list-management logic lives here. `App.tsx` calls `useConfessions()` in one line and gets everything it needs without seeing the internals. |
| `src/App.tsx` | 7 | `const { confessions, addConfession } = useConfessions()` — one clean line replaces what would be multiple `useState` calls and inline functions. |

---

## 11. Co-location

**Definition:** Place related code (component + its styles) in the same directory so you don't have to jump between folders to understand a feature.

**Files & Lines:**

| File | Co-located With |
|------|----------------|
| `src/components/ConfessionForm.tsx` | `src/components/ConfessionForm.css` |
| `src/components/ConfessionFeed.tsx` | `src/components/ConfessionFeed.css` |
| `src/components/ConfessionCard.tsx` | `src/components/ConfessionCard.css` |
| `src/App.tsx` | `src/App.css` |
| `src/main.tsx` | `src/index.css` (global styles live with the entry point) |

---

## 12. Early Return / Guard Clause Pattern

**Definition:** Check for the edge case first and exit early, so the "happy path" code can live without nesting.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/components/ConfessionFeed.tsx` | 10-16 | If there are no confessions, return the empty state immediately. The rest of the function doesn't need to worry about the empty case. |
| `src/hooks/useConfessions.ts` | 8-9 | If the trimmed text is empty, return `false` immediately. The rest of the function doesn't need to check again. |
| `src/components/ConfessionForm.tsx` | 20-24 | If the confession wasn't accepted, set error and return early. Lines 26-28 only run on success. |

---

## 13. Conditional Rendering

**Definition:** Render different UI elements depending on the current state, using JavaScript expressions inside JSX.

**Files & Lines:**

| File | Lines | Technique |
|------|-------|-----------|
| `src/components/ConfessionFeed.tsx` | 10-16 | **If/else** — return one JSX tree or another based on `confessions.length === 0`. |
| `src/components/ConfessionForm.tsx` | 47 | **Ternary in className** — `remaining <= 0 ? 'over' : ''` adds a CSS class conditionally. |
| `src/components/ConfessionForm.tsx` | 52 | **Logical AND** — `{error && <p>...</p>}` renders the error only when `error` is truthy. |
| `src/components/ConfessionForm.tsx` | 56 | **Boolean in attribute** — `disabled={text.trim().length === 0}` makes the button conditionally unclickable. |

---

## 14. Type Safety (Static Typing)

**Definition:** Use TypeScript to define exact shapes for data and function signatures so the compiler catches mismatches before the code runs.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/types.ts` | 1-5 | Defines the `Confession` interface — every confession must have an `id: number`, `text: string`, and `timestamp: Date`. |
| `src/hooks/useConfessions.ts` | 5 | `useState<Confession[]>([])` — the state array can only hold objects that match the `Confession` shape. |
| `src/hooks/useConfessions.ts` | 7 | `(text: string): boolean` — the function takes a string and returns a boolean. |
| `src/components/ConfessionCard.tsx` | 15-17 | `ConfessionCardProps` — the component only accepts a `confession` that matches the `Confession` type. |
| `src/components/ConfessionForm.tsx` | 6-8 | `ConfessionFormProps` — the prop `onAddConfession` must be a function that takes a string and returns a boolean. |
| `src/components/ConfessionFeed.tsx` | 5-7 | `ConfessionFeedProps` — the confessions prop must be an array of `Confession` objects. |

---

## 15. Preventing Default Browser Behavior

**Definition:** Stop the browser from doing its built-in action (like reloading on form submit) so JavaScript can handle the event instead.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/components/ConfessionForm.tsx` | 18 | `e.preventDefault()` — without this line, submitting the form would reload the page, wiping all confessions from memory. |

---

## 16. Keyed Reconciliation (List Rendering with Stable Keys)

**Definition:** When rendering lists, give each item a unique, stable `key` prop so React can track which items are added, removed, or reordered — which is also required for CSS animations to fire on new items.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/components/ConfessionFeed.tsx` | 21 | `key={c.id}` — each `ConfessionCard` gets a unique key from the confession's timestamp-based ID. When a new confession is added, React sees a new key, creates a fresh DOM element, and the CSS `fadeIn` animation plays. Without this key, React might recycle an existing element and the animation would not fire. |

---

## 17. DRY (Don't Repeat Yourself)

**Definition:** Every piece of knowledge has a single, unambiguous representation in the system. Avoid duplicating logic or type definitions.

**Files & Lines:**

| File | Lines | What's Happening |
|------|-------|------------------|
| `src/types.ts` | 1-5 | The `Confession` interface is defined **once** and imported everywhere it's needed (useConfessions.ts:2, ConfessionCard.tsx:1, ConfessionFeed.tsx:1). If a field changes, only this file needs editing. |
| `src/hooks/useConfessions.ts` | 4-22 | The add-confession logic (trim, validate, create, prepend) lives in **one** function instead of being repeated across components. |
| `src/components/ConfessionCard.tsx` | 4-13 | The `timeAgo` helper is written once instead of repeating the calculation in every card render. |

---

## Summary Table

| # | Principle | Primary Location |
|---|-----------|-----------------|
| 1 | Controlled Components | `ConfessionForm.tsx:11,39,40-43` |
| 2 | Immutability | `useConfessions.ts:17` |
| 3 | Lifting State Up | `App.tsx:7,16-17` |
| 4 | Props Down, Events Up | `App.tsx:16-17` → `ConfessionForm.tsx:20` |
| 5 | Separation of Concerns | All files — each has one responsibility |
| 6 | Encapsulation | `useConfessions.ts:21`, `ConfessionCard.tsx:4` |
| 7 | Composition | `App.tsx:16-17`, `ConfessionFeed.tsx:21` |
| 8 | Single Responsibility | Every component and function |
| 9 | Declarative Programming | `ConfessionFeed.tsx:10-24`, `ConfessionForm.tsx:47,52,56` |
| 10 | Custom Hook Encapsulation | `useConfessions.ts:4-22`, `App.tsx:7` |
| 11 | Co-location | Each `.tsx` has a matching `.css` in the same folder |
| 12 | Early Return / Guard Clause | `ConfessionFeed.tsx:10`, `useConfessions.ts:9`, `ConfessionForm.tsx:20` |
| 13 | Conditional Rendering | `ConfessionFeed.tsx:10-16`, `ConfessionForm.tsx:47,52,56` |
| 14 | Type Safety | `types.ts:1-5`, all prop interfaces |
| 15 | Preventing Default Browser Behavior | `ConfessionForm.tsx:18` |
| 16 | Keyed Reconciliation | `ConfessionFeed.tsx:21` |
| 17 | DRY | `types.ts`, `useConfessions.ts:4-22`, `ConfessionCard.tsx:4-13` |
