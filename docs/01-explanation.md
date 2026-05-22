# Confession Cathedral — Explained Like You're Seven

Think of this app like a **digital whisper wall**. You type a secret, drop it in a box, and it pops up on a wall for everyone to see — but nobody knows it was you. This document walks through every single file, one line at a time, and explains how the magic works.

---

## `index.html` — The front door

```
1: <!doctype html>
```

This line tells the web browser: "Hey, this is an HTML page!" It's like saying "once upon a time" before starting a story.

```
2: <html lang="en">
```

Opens the html wrapper and says the page is in English.

```
3:   <head>
4:     <meta charset="UTF-8" />
```

The `<head>` is like the brain of the page — stuff here isn't visible on screen. `charset="UTF-8"` means the page can handle any letter from any language, including emojis.

```
5:     <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

The little icon that shows up in the browser tab. It's a picture file called `favicon.svg`.

```
6:     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

This tells phones and tablets: "Fit the page to the screen size so it doesn't look tiny."

```
7:     <title>Confession Cathedral</title>
```

The name that appears in the browser tab at the top.

```
8:   </head>
9:   <body>
10:     <div id="root"></div>
```

The `<body>` is where visible stuff goes. Right now it's nearly empty — there's just a single empty `<div>` with the ID `root`. This is like an empty picture frame. The React app will paint everything inside this frame.

```
11:     <script type="module" src="/src/main.tsx"></script>
```

This is the engine. It says: "Go find the file `src/main.tsx`, run it, and whatever it produces, stuff it into that empty `<div id="root">`."

```
12:   </body>
13: </html>
```

Closes the body and the html wrapper. We're done setting up the stage.

---

## `src/main.tsx` — The engine starter

```
1: import { StrictMode } from 'react'
```

Brings in `StrictMode` from the React library. This is like a strict teacher who checks your homework extra carefully for mistakes. It only runs when you're developing, not when real people visit the site.

```
2: import { createRoot } from 'react-dom/client'
```

Brings in `createRoot` — this is the tool that connects React to the real webpage. "DOM" means the actual stuff you see in the browser.

```
3: import './index.css'
```

Loads the file `index.css` (which we'll look at later). This is like putting on the background paint and the global rules for how everything looks.

```
4: import App from './App.tsx'
```

Brings in the `App` component (our main page layout) from the file `App.tsx`.

```
6: createRoot(document.getElementById('root')!).render(
```

This is the biggest moment: it finds the empty `<div id="root">` from `index.html`, grabs it, and tells React: "Paint your stuff here." The `!` mark is TypeScript saying "trust me, this element exists."

```
7:   <StrictMode>
8:     <App />
9:   </StrictMode>,
10: )
```

Wraps `<App />` inside `<StrictMode>` so React checks for mistakes. The `<App />` tag is the whole app — everything starts there.

---

## `src/types.ts` — The rulebook for a Confession

```
1: export interface Confession {
```

This creates a **blueprint** called `Confession`. A blueprint says: "every confession must have these things." `export` means other files are allowed to use this blueprint.

```
2:   id: number;
```

Every confession gets a unique number ID. We use `Date.now()` which is the current time in milliseconds — so no two confessions ever have the same ID.

```
3:   text: string;
```

The actual words the person wrote. A `string` is just a fancy word for text.

```
4:   timestamp: Date;
```

The exact moment the confession was posted. `Date` is a JavaScript thing that stores a moment in time.

```
5: }
```

Closes the blueprint.

---

## `src/hooks/useConfessions.ts` — The memory box

This file is a **hook** — a special React function that remembers things and lets other components ask for them.

```
1: import { useState, useCallback } from 'react';
```

Brings in two tools from React:
- `useState` — a box that remembers a value and can change it over time.
- `useCallback` — a wrapper that keeps a function the same so it doesn't get recreated every time.

```
2: import type { Confession } from '../types';
```

Brings in the `Confession` blueprint so we can make real confessions that follow the rules.

```
4: export function useConfessions() {
```

Creates the hook function and exports it so other files can use it.

```
5:   const [confessions, setConfessions] = useState<Confession[]>([]);
```

This is the most important line for **state**. `useState` creates a box:
- The box's current contents are called `confessions` — an array (list) of Confession objects. It starts empty: `[]`.
- The tool to change what's in the box is called `setConfessions`.
- `<Confession[]>` is TypeScript saying "this list can only hold Confession-shaped things."

Every time `setConfessions` is called with new data, React remembers the new list and **re-draws** any part of the page that shows confessions.

```
7:   const addConfession = useCallback((text: string): boolean => {
```

Creates a function called `addConfession` that:
- Takes in `text` (a string — what the person typed).
- Returns a `boolean` (true if it worked, false if it didn't).
- `useCallback` wraps it so React doesn't keep making new copies of this function. The empty `[]` at line 19 means "only create this function once, never re-create it."

```
8:     const trimmed = text.trim();
```

`trim()` is a string method that removes all the spaces at the beginning and end. So `"   hello   "` becomes `"hello"`. This is how we catch people who only type spaces.

```
9:     if (trimmed.length === 0) return false;
```

If after trimming there's nothing left (zero characters), the function returns `false` to say "sorry, empty confessions aren't allowed." This is the **empty/whitespace filter**.

```
11:     const newConfession: Confession = {
12:       id: Date.now(),
13:       text: trimmed,
14:       timestamp: new Date(),
15:     };
```

Creates a fresh confession object that follows the blueprint:
- `id` is set to the current time in milliseconds (e.g., `1712345678901`). This guarantees uniqueness.
- `text` is the trimmed version of what the user typed.
- `timestamp` is `new Date()` which captures the exact current moment.

```
17:     setConfessions((prev) => [newConfession, ...prev]);
```

**This is the state update.** `setConfessions` receives a function. The function gets the **previous** list (`prev`) and returns a **new** list:
- `newConfession` is put first (at the front).
- `...prev` spreads all the old confessions after it.

The `...` (spread operator) is like saying "take everything that was in the old list and put it here." We never modify the old list — we create a **brand new list** with the new confession at the front. This is how React knows something changed: the old list and the new list are different objects.

```
18:     return true;
```

Returns `true` to say "the confession was added successfully."

```
21:   return { confessions, addConfession };
```

Returns both the confessions list and the add-confession function so any component that calls `useConfessions()` gets both.

---

## `src/components/ConfessionForm.tsx` — The typing box

This is where a person writes their secret and submits it. It's the most complex component because of the **controlled input**.

```
1: import { useState, useRef, type FormEvent } from 'react';
```

Brings in:
- `useState` — to remember what the user is typing and any error messages.
- `useRef` — to grab ahold of the textarea element directly (like putting a bookmark on it).
- `FormEvent` — the type for a form submission event.

```
2: import './ConfessionForm.css';
```

Loads the stylesheet that makes the form look nice.

```
4: const MAX_CHARS = 280;
```

A constant (a value that never changes) set to 280. This is the character limit, modeled after Twitter's old limit.

```
6: interface ConfessionFormProps {
7:   onAddConfession: (text: string) => boolean;
8: }
```

Describes what props (inputs) this component expects: a single function called `onAddConfession` that takes a string and returns true/false.

```
10: export default function ConfessionForm({ onAddConfession }: ConfessionFormProps) {
```

Defines the component. It receives `onAddConfession` as a prop — this is the function from `useConfessions` that actually adds a confession to the list.

```
11:   const [text, setText] = useState('');
```

**This creates the controlled input.** `text` holds whatever the user has typed so far. It starts as an empty string `''`. `setText` is the function to update it.

Every time the user types a key, `setText` is called with the new value, and React re-renders the textarea to show the new value. This is what makes it "controlled" — React is in charge of the value, not the browser.

```
12:   const [error, setError] = useState('');
```

Another piece of state: holds an error message. Starts empty (no error).

```
13:   const textareaRef = useRef<HTMLTextAreaElement>(null);
```

Creates a ref (reference) to the textarea element. Think of it like a bookmark: `textareaRef.current` will point directly at the `<textarea>` DOM element once the component is on the page. `null` means "it doesn't point to anything yet."

```
15:   const remaining = MAX_CHARS - text.length;
```

Calculates how many characters the user has left. If `text` is `"hello"` (5 characters), `remaining` is `280 - 5 = 275`. This number updates on every keystroke because `text` updates on every keystroke.

```
17:   function handleSubmit(e: FormEvent) {
18:     e.preventDefault();
```

When the form is submitted (either by clicking the button or pressing Enter):
1. `e.preventDefault()` stops the browser from reloading the page (which is what forms normally do). This is very important — without it, the page would refresh and all confessions would disappear.

```
20:     const ok = onAddConfession(text);
21:     if (!ok) {
22:       setError('Confession cannot be empty.');
23:       return;
24:     }
```

Calls `onAddConfession` (the function from the hook) with the current text. If it returns `false` (empty or whitespace only), we set an error message and stop.

```
26:     setError('');
27:     setText('');
28:     textareaRef.current?.focus();
```

If the confession was accepted:
- Clear any error.
- **Reset `text` to empty string** — this is what clears the textarea. Because the textarea's `value` is set to `text` (line 39), when `setText('')` runs, React re-renders and the textarea shows nothing. The user's words are gone.
- `textareaRef.current?.focus()` puts the cursor back in the textarea so the user can type another confession immediately. The `?.` is optional chaining — it only calls `.focus()` if `textareaRef.current` isn't null.

```
31:   return (
32:     <form className="confession-form" onSubmit={handleSubmit}>
```

Renders a `<form>` element. When submitted, React calls `handleSubmit` (not the browser's default form behavior).

```
34:         <textarea
35:           ref={textareaRef}
36:           className="confession-textarea"
37:           placeholder="Drop your truth..."
```

The actual typing box:
- `ref={textareaRef}` attaches the bookmark so we can call `.focus()` later.
- `placeholder` is the ghost text shown when the box is empty.
- `rows={4}` makes it about 4 lines tall.

```
38:           maxLength={MAX_CHARS + 20}
```

`maxLength` is a browser-native limit. We set it to 300 (280 + 20) as a safety net. The real limit is enforced by the character counter UI and the disabled button — this just prevents the browser from allowing impossibly long text. The extra 20 characters gives some breathing room so the user can paste text and see it go red before trimming.

```
39:           value={text}
```

**This is what makes it a controlled input.** The textarea's displayed content is always whatever `text` state contains. When the user types, `onChange` fires (line 40), `setText` updates `text`, and React re-renders the textarea with the new value. The user never directly edits the textarea's content — they tell React what it should be, and React updates the browser.

```
40:           onChange={(e) => {
41:             setText(e.target.value);
42:             if (error) setError('');
43:           }}
```

Every keystroke runs this function:
- `e.target.value` is whatever is currently in the textarea (including the new character the user just typed).
- `setText(e.target.value)` stores it in state.
- If there's an error showing, clear it — the user is now typing, so the empty error is no longer relevant.

```
46:         <span
47:           className={`char-counter ${remaining <= 0 ? 'over' : ''}`}
48:         >
49:           {remaining}
50:         </span>
```

The character counter:
- Shows `remaining` (e.g., "275").
- The className changes based on `remaining <= 0`. If the count hits 0 or goes below, the class `"over"` is added, which makes the text turn red (defined in CSS).

```
52:       {error && <p className="form-error">{error}</p>}
```

If `error` is not empty, show the error message. React conditional rendering: if the left side is falsy (empty string), React doesn't render anything. If it's truthy, React renders the `<p>` element.

```
53:       <button
54:         type="submit"
55:         className="submit-btn"
56:         disabled={text.trim().length === 0}
57:       >
58:         Confess
59:       </button>
```

The submit button:
- `disabled` is `true` when the trimmed text is empty. The user can't submit until they type something real.
- Because `text` updates on every keystroke, this check runs on every keystroke. As soon as the user types their first non-space character, the button enables.

---

## `src/components/ConfessionCard.tsx` — One confession on the wall

```
1: import type { Confession } from '../types';
2: import './ConfessionCard.css';
```

Brings in the Confession blueprint and the stylesheet.

```
4: function timeAgo(date: Date): string {
```

A helper function that takes a `Date` and returns a human-friendly string like `"just now"` or `"5m ago"`. It's defined inside this file, not exported, so only ConfessionCard can use it.

```
5:   const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
```

Calculates how many seconds have passed since the confession was posted:
- `Date.now()` is the current time in milliseconds.
- `date.getTime()` is the confession's timestamp in milliseconds.
- Subtract to get the difference, divide by 1000 to get seconds.
- `Math.floor()` rounds down (so 4.9 seconds becomes 4).

```
6:   if (seconds < 60) return 'just now';
```

If less than a minute has passed, say "just now."

```
7:   const minutes = Math.floor(seconds / 60);
8:   if (minutes < 60) return `${minutes}m ago`;
```

If less than an hour, show minutes. The backticks `` ` `` allow embedding variables: `` `${minutes}m ago` `` becomes `"5m ago"`.

```
9:   const hours = Math.floor(minutes / 60);
10:   if (hours < 24) return `${hours}h ago`;
```

If less than a day, show hours.

```
11:   const days = Math.floor(hours / 24);
12:   return `${days}d ago`;
```

Otherwise, show days.

```
15: interface ConfessionCardProps {
16:   confession: Confession;
17: }
```

The card expects one prop: a `confession` object that follows the `Confession` blueprint.

```
19: export default function ConfessionCard({ confession }: ConfessionCardProps) {
20:   return (
21:     <article className="confession-card">
```

`<article>` is an HTML tag for a standalone piece of content — perfect for a single confession.

```
22:       <p className="confession-text">{confession.text}</p>
```

Shows the confession text. `confession.text` comes from the `confession` prop.

```
23:       <time className="confession-time">{timeAgo(confession.timestamp)}</time>
```

Shows how long ago the confession was posted, using the `timeAgo` helper.

---

## `src/components/ConfessionCard.css` — How a card looks and fades in

```
1: @keyframes fadeIn {
2:   from {
3:     opacity: 0;
4:     transform: translateY(10px);
5:   }
6:   to {
7:     opacity: 1;
8:     transform: translateY(0);
9:   }
10: }
```

**This is the animation logic.** `@keyframes fadeIn` defines a custom animation named "fadeIn":

- **`from` (start):** The card is invisible (`opacity: 0`) and pushed down 10 pixels (`translateY(10px)`).
- **`to` (end):** The card is fully visible (`opacity: 1`) and in its normal position (`translateY(0)` — no push).

The animation moves from "invisible and a little below" to "visible and right where it belongs."

```
12: .confession-card {
13:   background: #14141c;
14:   border: 1px solid #2a2a35;
15:   border-radius: 10px;
16:   padding: 18px 22px;
17:   margin-bottom: 14px;
18:   animation: fadeIn 0.4s ease-out;
```

**Line 18 is where the animation plays.** It says: "When a `.confession-card` first appears on the page, play the `fadeIn` animation over 0.4 seconds with an `ease-out` timing (starts fast, slows down at the end)."

**Important:** This animation runs every time the card element appears in the DOM. When a new confession is added, React creates a new `<ConfessionCard>` component for it. That new card enters the DOM and the browser plays the `fadeIn` animation from start to finish. Old cards are not re-created — they just shift down to make room.

```
19:   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
20: }
```

Adds a subtle shadow underneath the card, making it look like it's floating slightly above the background.

```
22: .confession-text {
23:   font-family: 'Georgia', 'Times New Roman', serif;
```

Uses a serif font (the kind with little feet on the letters) — makes it feel like a handwritten letter or a book.

```
24:   font-size: 16px;
25:   line-height: 1.55;
26:   color: #e8e0d0;
27:   margin: 0 0 10px;
28:   word-break: break-word;
29:   white-space: pre-wrap;
```

- `word-break: break-word` — if a single word is super long (like a URL), break it in the middle so it doesn't overflow the card.
- `white-space: pre-wrap` — preserves line breaks the user typed. If someone writes three paragraphs, they stay three paragraphs.

```
32: .confession-time {
33:   font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
34:   font-size: 12px;
35:   color: #6b6570;
36:   letter-spacing: 0.3px;
```

The timestamp is small (12px), muted gray, with a tiny bit of extra space between letters. It's meant to be subtle so the confession text is the star.

---

## `src/components/ConfessionFeed.tsx` — The wall of confessions

```
1: import type { Confession } from '../types';
2: import ConfessionCard from './ConfessionCard';
3: import './ConfessionFeed.css';
```

Brings in the Confession blueprint, the ConfessionCard component, and the feed's styles.

```
5: interface ConfessionFeedProps {
6:   confessions: Confession[];
7: }
```

This component expects one prop: a list (array) of Confession objects.

```
9: export default function ConfessionFeed({ confessions }: ConfessionFeedProps) {
10:   if (confessions.length === 0) {
11:     return (
12:       <div className="feed-empty">
13:         <p>No confessions yet. Be the first.</p>
14:       </div>
15:     );
16:   }
```

**This is the empty state.** If there are zero confessions, instead of showing a blank wall, we show a friendly message: "No confessions yet. Be the first." This is important — without it, new visitors would see nothing and be confused.

```
18:   return (
19:     <section className="confession-feed">
20:       {confessions.map((c) => (
21:         <ConfessionCard key={c.id} confession={c} />
22:       ))}
23:     </section>
24:   );
```

When there ARE confessions:
- `.map()` loops over every item in the `confessions` array. For each one, it creates a `<ConfessionCard>` component.
- `key={c.id}` is **very important for React**. Each card gets a unique key based on its ID. React uses the key to know which cards are new, which are old, and which ones to animate. Without a key, React might re-use an old card's DOM element for a new confession, and the fade-in animation wouldn't play because the element didn't really "appear" — it just got new text. With the key, React sees a brand new element and plays the animation.

Because the `confessions` list is sorted newest-first (from `useConfessions` where `[newConfession, ...prev]` puts new ones at the front), the newest confession is always at the top.

---

## `src/components/ConfessionFeed.css` — How the feed looks

```
1: .confession-feed {
2:   display: flex;
3:   flex-direction: column;
4: }
```

Makes the feed a vertical stack — cards stack on top of each other like a pile of letters.

```
6: .feed-empty {
7:   text-align: center;
8:   padding: 60px 20px;
9:   color: #6b6570;
10:   font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
11:   font-size: 15px;
12:   font-style: italic;
13: }
```

The empty state message: centered, lots of padding so it sits in the middle, muted gray, italic. It quietly invites the first confession.

---

## `src/components/ConfessionForm.css` — How the form looks

```
1: .confession-form {
2:   margin-bottom: 32px;
3: }
4: 
5: .textarea-wrapper {
6:   position: relative;
7:   margin-bottom: 12px;
8: }
```

The textarea wrapper is `position: relative` so the character counter (which is `position: absolute`) can be placed inside it using the wrapper as an anchor.

```
10: .confession-textarea {
11:   width: 100%;
12:   box-sizing: border-box;
13:   padding: 16px 60px 16px 18px;
14:   border: 1px solid #2a2a35;
15:   border-radius: 10px;
16:   background: #14141c;
17:   color: #e8e0d0;
18:   font-family: 'Georgia', 'Times New Roman', serif;
19:   font-size: 15px;
20:   line-height: 1.55;
21:   resize: vertical;
22:   min-height: 90px;
23:   outline: none;
24:   transition: border-color 0.2s;
```

- `width: 100%` — stretches across the whole container.
- `box-sizing: border-box` — includes padding in the width calculation so it doesn't overflow.
- The right padding is extra large (60px) to make room for the char counter that sits inside the textarea.
- `resize: vertical` — users can drag the bottom-right corner to make the box taller, but not wider (so the layout stays clean).
- `outline: none` — removes the blue glow browsers add when an element is focused (we replace it with our own border color).
- `transition: border-color 0.2s` — when the border color changes (on focus), it fades smoothly over 0.2 seconds.

```
27: .confession-textarea::placeholder {
28:   color: #4a4450;
29:   font-style: italic;
30: }
```

The ghost text "Drop your truth..." is a muted purple-gray, italic.

```
32: .confession-textarea:focus {
33:   border-color: #c9a85e;
34: }
```

When the user clicks into the textarea, the border turns gold (`#c9a85e`). The `transition` on line 24 makes this color change smooth rather than instant.

```
36: .char-counter {
37:   position: absolute;
38:   bottom: 14px;
39:   right: 16px;
40:   font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
41:   font-size: 12px;
42:   color: #6b6570;
43:   transition: color 0.2s;
44: }
```

The character counter sits inside the textarea, anchored to the bottom-right corner. It starts muted gray. `transition: color 0.2s` makes the color change to red smooth rather than jarring.

```
46: .char-counter.over {
47:   color: #e05252;
48:   font-weight: 600;
49: }
```

When the character counter has the class `"over"` (which happens when `remaining <= 0`), the text turns red and bolds slightly. The `transition` from line 43 makes this fade from gray to red smoothly.

```
51: .form-error {
52:   color: #e05252;
53:   font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
54:   font-size: 13px;
55:   margin: 0 0 12px;
56: }
```

Error messages are red but smaller (13px) and sit below the textarea.

```
58: .submit-btn {
59:   display: inline-block;
60:   padding: 10px 32px;
61:   border: none;
62:   border-radius: 8px;
63:   background: #c9a85e;
64:   color: #0a0a0f;
65:   font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
66:   font-size: 15px;
67:   font-weight: 600;
68:   cursor: pointer;
69:   transition: background 0.2s, opacity 0.2s;
70: }
```

The submit button:
- Gold background (`#c9a85e`), dark text — it pops against the dark background.
- `cursor: pointer` — the mouse turns into a hand when hovering.
- `transition: background 0.2s, opacity 0.2s` — smooth changes for hover and disabled states.

```
72: .submit-btn:hover:not(:disabled) {
73:   background: #dcc07a;
74: }
```

When hovering over the button (and it's not disabled), the background gets lighter gold. The `:not(:disabled)` part means: if the button IS disabled, don't change the background on hover.

```
76: .submit-btn:disabled {
77:   opacity: 0.35;
78:   cursor: not-allowed;
79: }
```

When the button is disabled (empty textarea), it fades to 35% opacity and the cursor becomes a "no" symbol.

---

## `src/App.tsx` — The main organizer

```
1: import { useConfessions } from './hooks/useConfessions';
2: import ConfessionForm from './components/ConfessionForm';
3: import ConfessionFeed from './components/ConfessionFeed';
4: import './App.css';
```

Brings in the hook (for confessions state), the form (for typing), the feed (for showing), and the styles.

```
6: function App() {
7:   const { confessions, addConfession } = useConfessions();
```

This single line **creates the state** for the whole app. `useConfessions()` returns two things:
- `confessions` — the current list of all confessions (starts empty, grows as people submit).
- `addConfession` — the function to add a new one.

Because `App` is the top-level component, this state lives here and flows down to children.

```
9:   return (
10:     <div className="app">
11:       <header className="app-header">
12:         <h1>Confession Cathedral</h1>
13:         <p className="app-subtitle">Drop your truth.</p>
14:       </header>
```

The header: a big title and a small subtitle. This is the only part that doesn't change — it's always the same.

```
15:       <main className="app-main">
16:         <ConfessionForm onAddConfession={addConfession} />
```

Passes `addConfession` to the form as a prop. When the form calls `onAddConfession(text)`, it's actually calling `addConfession` from the hook, which calls `setConfessions`, which updates state.

```
17:         <ConfessionFeed confessions={confessions} />
```

Passes the confessions list to the feed. When `useConfessions` calls `setConfessions` with a new list (after a confession is added), React re-renders `App`, which re-renders `ConfessionFeed`, which sees the new confessions array and creates new `<ConfessionCard>` elements with the fade-in animation.

---

## `src/App.css` — How the main page looks

```
1: .app {
2:   max-width: 640px;
3:   margin: 0 auto;
4:   padding: 48px 20px 80px;
5:   min-height: 100svh;
```

- `max-width: 640px` — the content never gets wider than 640 pixels (like a narrow book page).
- `margin: 0 auto` — centers it horizontally.
- `min-height: 100svh` — makes sure it's at least as tall as the screen, even if there are no confessions yet.

```
8: .app-header {
9:   text-align: center;
10:   margin-bottom: 40px;
11: }
```

The header is centered with lots of space below it.

```
13: .app-header h1 {
14:   font-family: 'Georgia', 'Times New Roman', serif;
15:   font-size: 36px;
16:   font-weight: 400;
17:   color: #f5e6b8;
18:   letter-spacing: 1px;
19:   margin: 0 0 8px;
```

The main title: serif font (classic book feel), large (36px), gold color (`#f5e6b8`), slightly spread out letters (`letter-spacing: 1px`). It's meant to feel old and reverent — like a cathedral.

```
22: .app-subtitle {
23:   font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
24:   font-size: 14px;
25:   color: #6b6570;
26:   font-style: italic;
27:   margin: 0;
```

The subtitle is small, gray, italic. It doesn't compete with the title.

```
30: .app-main {
31:   display: flex;
32:   flex-direction: column;
```

The main content stacks vertically (form on top, feed below).

---

## `src/index.css` — The global wallpaper

```
1: *,
2: *::before,
3: *::after {
4:   box-sizing: border-box;
5: }
```

A universal selector (`*` means "every element"). It says: every single thing on the page should use `box-sizing: border-box`, which means padding and border are included in an element's width calculation. This prevents accidental overflow and makes layout math much easier.

```
7: :root {
8:   font-family: system-ui, 'Segoe UI', Roboto, sans-serif;
```

Sets the default font for the whole page to a clean system font.

```
9:   font-size: 16px;
10:   line-height: 1.5;
11:   color: #e8e0d0;
12:   background: #0a0a0f;
```

- Default text color: a warm off-white (`#e8e0d0`).
- Background: nearly black (`#0a0a0f`). This is the "dark cathedral" vibe.

```
13:   color-scheme: dark;
```

Tells the browser this is a dark-themed page, so native elements (like scrollbars) should be dark too.

```
14:   -webkit-font-smoothing: antialiased;
15:   -moz-osx-font-smoothing: grayscale;
```

Two lines that make text look smoother on screens, especially on Macs.

```
18: body {
19:   margin: 0;
20: }
```

Removes the default 8px margin that browsers add to the body. Without this, there would be a white gap around the dark background.

```
22: #root {
23:   min-height: 100svh;
24: }
```

The root div (where React paints everything) must be at least as tall as the screen. This ensures the dark background fills the whole page even if there's no content yet.

---

## Traffic Flow: How a Keystroke Becomes a Card

Let's trace one complete journey from typing to seeing your confession on the wall.

### Step 1 — You press a key
Your finger hits the 'H' key while the textarea is focused.

### Step 2 — The browser fires an event
The browser detects the keypress and fires an `onChange` event on the textarea. The event object `e` has `e.target.value = "H"`.

### Step 3 — React stores the character
`ConfessionForm`'s `onChange` handler runs: `setText("H")`. React stores `"H"` as the new value of the `text` state variable.

### Step 4 — React re-renders the form
Because `text` changed, React re-renders `ConfessionForm`:
- The textarea shows `"H"` because `value={text}` is now `"H"`.
- `remaining` is now `279` because `280 - 1 = 279`. The counter shows `279`.
- The submit button checks `text.trim().length === 0` — since `"H"` has length 1, the button is no longer disabled.

All of this happens in a few milliseconds. To you, it looks instant.

### Step 5 — You click "Confess"
The form's `onSubmit` fires. `handleSubmit` runs:
1. `e.preventDefault()` stops a page reload.
2. `onAddConfession("H")` calls the hook's `addConfession`.
3. The hook trims the text, checks it's not empty, creates a new `Confession` object with `id: Date.now()` and `timestamp: new Date()`.
4. `setConfessions((prev) => [newConfession, ...prev])` creates a new array with the new confession first.
5. Returns `true`.
6. Back in the form: `setText('')` clears the textarea. `setError('')` clears any error. `textareaRef.current?.focus()` puts the cursor back.

### Step 6 — React re-renders the whole app
Because `confessions` (state in `App`) changed, React re-renders `App`, which re-renders `ConfessionFeed`, which calls `.map()` on the new confessions array.

### Step 7 — A new card appears
For the new confession, React creates a `<ConfessionCard key={newConfession.id} confession={newConfession} />`. This is a **new DOM element** that didn't exist before. The browser sees it enter the DOM and runs the `fadeIn` CSS animation: the card fades from invisible to visible and slides up 10 pixels over 0.4 seconds.

### Step 8 — You see your confession
It's at the top of the feed, fully visible, with the text you wrote and a timestamp saying "just now."

---

## Controlled Input — The Detailed Explanation

A "controlled input" is when React, not the browser, is the boss of what appears in a text field.

**Without control (uncontrolled):**
The user types, the browser puts letters in the box directly. React has no idea what's in there unless you go looking for it.

**With control (controlled):**
There's a value (`value={text}`) and an onChange handler. Every time the user types:
1. The browser tries to put the new letter in the box.
2. React stops that from happening.
3. React runs `onChange`, which calls `setText(newValue)`.
4. React re-renders, and the textarea shows whatever `text` is.

It seems roundabout, but it gives us superpowers:
- We can format the input (e.g., auto-capitalize).
- We can reject characters (e.g., no numbers).
- We can show live feedback (character counter).
- We can easily clear the input (just `setText('')`).

In this app, the character counter and the submit button both depend on knowing exactly what's in the textarea. That's only possible because it's controlled.

---

## State Updates — How React Remembers Things

State is React's memory. There are three pieces of state in this app:

### 1. `confessions` (in `useConfessions`)
- **Where:** The `useConfessions` hook.
- **Type:** Array of `Confession` objects.
- **Updates when:** Someone submits a valid confession.
- **Who reads it:** `ConfessionFeed` (to render cards) and `App` (to pass it down).
- **Update rule:** We never modify the old array. We create a brand new one with `[newConfession, ...prev]`. This lets React detect the change by comparing old array vs new array (they're different objects in memory).

### 2. `text` (in `ConfessionForm`)
- **Where:** The `ConfessionForm` component.
- **Type:** String.
- **Updates when:** The user types or clears the form.
- **Who reads it:** The textarea's `value`, the character counter, and the submit button.
- **Update rule:** Every keystroke calls `setText` with the full new string.

### 3. `error` (in `ConfessionForm`)
- **Where:** The `ConfessionForm` component.
- **Type:** String.
- **Updates when:** The user submits empty text, or starts typing after an error.
- **Who reads it:** The error message element.
- **Update rule:** Set to a message on failed submit, cleared on keystroke.

### The Update Cycle
1. Something happens (keypress, click).
2. An event handler runs a `setXxx` function.
3. React schedules a re-render of that component (and its children).
4. During re-render, React calls the component function again.
5. This time, the state variable has the new value.
6. The returned JSX reflects the new value.
7. React compares old and new JSX, figures out what changed in the real DOM, and applies only those changes.

---

## Animation Logic — How Cards Fade In

The fade-in uses **CSS animations**, not JavaScript. Here's exactly how it works:

### The Keyframes
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

This defines two snapshots:
- **Start:** invisible, 10 pixels below where it should be.
- **End:** fully visible, right where it should be.

### Playing the Animation
```css
.confession-card {
  animation: fadeIn 0.4s ease-out;
}
```

Every card plays `fadeIn` when it enters the DOM:
- Duration: 0.4 seconds.
- Timing: `ease-out` (fast at the beginning, slow at the end — like a ball settling).

### The Critical Detail: React Keys
The animation only works if React creates a **brand new DOM element** for each new confession. That's where `key={c.id}` in `ConfessionFeed` comes in:

- Without keys: React might take an existing card's DOM element and just swap its text. The CSS animation wouldn't play because the element didn't appear — it was already there.
- With keys: React sees `c.id` is a new value it hasn't seen before, so it creates a new `<article>` element. When that fresh element enters the DOM, the browser plays the `fadeIn` animation.

This is the most common gotcha with CSS animations in React: **without proper keys, animations won't play for new items.**

---

## Summary

| Concept | Where | How |
|---------|-------|-----|
| Controlled input | `ConfessionForm.tsx` | `value={text}` + `onChange` handler |
| State (confessions) | `useConfessions.ts` | `useState<Confession[]>([])` |
| State (text) | `ConfessionForm.tsx` | `useState('')` |
| State (error) | `ConfessionForm.tsx` | `useState('')` |
| State update | `useConfessions.ts:17` | `setConfessions((prev) => [newConfession, ...prev])` |
| Empty filter | `useConfessions.ts:9` | `if (trimmed.length === 0) return false` |
| Animation | `ConfessionCard.css:1-10,18` | `@keyframes fadeIn` + `animation: fadeIn 0.4s ease-out` |
| Animation trigger | `ConfessionFeed.tsx:20-21` | `.map()` with `key={c.id}` creates new DOM elements |
| Character limit | `ConfessionForm.tsx:4,15,47` | `MAX_CHARS = 280`, `remaining` calculation, CSS class toggle |
| Empty state | `ConfessionFeed.tsx:10-16` | Conditional render when `confessions.length === 0` |
| Page refresh prevention | `ConfessionForm.tsx:18` | `e.preventDefault()` |
