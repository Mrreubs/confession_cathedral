# Confession Cathedral — Code Audit

Four big questions answered: XSS, accessibility, performance, and anti-patterns. Each issue
comes with a fix, explained like a patient teacher.

---

## 1. XSS: Can someone inject a malicious script?

### The worry

A user types this into the confession box:

```html
<script>alert('hacked')</script>
```

If we just dump that string into the page as raw HTML, the browser runs the script. That's a
**Cross-Site Scripting (XSS)** attack. The attacker can steal cookies, redirect the page, or
worse.

### Current status — you are already safe

React has a built-in shield. Look at `ConfessionCard.tsx:22`:

```tsx
<p className="confession-text">{confession.text}</p>
```

React's JSX uses `{expression}` — it **escapes** the value before rendering. It converts `<`
to `&lt;`, `>` to `&gt;`, `"` to `&quot;`, and so on. The browser sees harmless text, not
HTML tags.

Try it: type `<script>alert('xss')</script>` into the form. It will appear on the card
exactly as typed — the angle brackets won't be interpreted as HTML.

This is different from `dangerouslySetInnerHTML`, which would run the string as raw HTML.
We never use that.

### The one thing you must never do

If future you is ever tempted to write:

```tsx
<p dangerouslySetInnerHTML={{ __html: confession.text }} />
```

**Don't.** That bypasses React's escaping. If you need to render formatted text (bold,
links, etc.), use a proper sanitization library like DOMPurify — but for a 280-character
anonymous confession wall, plain text is the safest and most appropriate choice.

### Verdict

| Risk | Severity | Fixed? |
|------|----------|--------|
| XSS via confession text | None | Yes, React's JSX escaping handles it automatically |
| `dangerouslySetInnerHTML` used anywhere | N/A | Not present — zero occurrences |

---

## 2. Accessibility: Can everyone use the form?

### The worry

A person using a screen reader, or someone who navigates with a keyboard instead of a mouse,
needs to be able to type a confession, see the character count, understand errors, and submit.

### Issue 1 — Missing `<label>` for the textarea

**Location:** `ConfessionForm.tsx:34-45`

The textarea has a `placeholder` ("Drop your truth...") but no `<label>` element. Screen
readers announce the placeholder, but it disappears once the user starts typing. A `<label>`
is always present and gives a persistent name to the control.

**The fix — add an invisible `<label>` connected by `htmlFor`:**

```tsx
<label htmlFor="confession-input" className="sr-only">
  Your confession
</label>
<textarea
  id="confession-input"
  ref={textareaRef}
  className="confession-textarea"
  placeholder="Drop your truth..."
  maxLength={MAX_CHARS + 20}
  value={text}
  onChange={(e) => {
    setText(e.target.value);
    if (error) setError('');
  }}
  rows={4}
/>
```

The `htmlFor="confession-input"` on the label and `id="confession-input"` on the textarea
wire them together. The `sr-only` class (defined below) hides the label visually but keeps
it for screen readers.

### Issue 2 — Character counter is not announced

**Location:** `ConfessionForm.tsx:46-50`

The character counter is a `<span>` with a number. A sighted user sees it turn red, but a
screen reader user won't know the count is changing.

**The fix — add `aria-live` to announce changes:**

```tsx
<span
  className={`char-counter ${remaining <= 0 ? 'over' : ''}`}
  aria-live="polite"
  aria-label={`${remaining} characters remaining`}
>
  {remaining}
</span>
```

`aria-live="polite"` tells the screen reader: "When this text changes, announce it, but
wait until I'm idle." `aria-label` gives a full sentence description of the number.

### Issue 3 — Error message is not associated with the form

**Location:** `ConfessionForm.tsx:52`

The error is a `<p>` that appears conditionally. Screen readers won't know it's related to
the form or the textarea.

**The fix — add `role="alert"`:**

```tsx
{error && <p className="form-error" role="alert">{error}</p>}
```

`role="alert"` makes the screen reader announce the error immediately when it appears.

### Issue 4 — No `sr-only` utility class

We need the `sr-only` class mentioned in Fix 1. Add it to `index.css`:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

This is the standard pattern: the element takes zero visual space but is still in the
accessibility tree.

### Issue 5 — Submit button lacks loading or disabled feedback for screen readers

**Location:** `ConfessionForm.tsx:53-59`

The button has `disabled` which is announced by screen readers, so this one is okay. But
let's confirm: `aria-disabled` is not needed because the native `disabled` attribute already
prevents interaction and is announced.

### Accessibility checklist

| Issue | Lines | Severity | Fixed below? |
|-------|-------|----------|--------------|
| Missing `<label>` for textarea | 34-45 | High | Yes |
| Character counter not announced | 46-50 | Medium | Yes |
| Error not associated with form | 52 | Medium | Yes |
| No `sr-only` utility class | `index.css` | Low | Yes |
| Button disabled state announced | 56 | Already OK | No fix needed |

### Full fixed snippet of `ConfessionForm.tsx`

```tsx
import { useState, useRef, type FormEvent } from 'react';
import './ConfessionForm.css';

const MAX_CHARS = 280;

interface ConfessionFormProps {
  onAddConfession: (text: string) => boolean;
}

export default function ConfessionForm({ onAddConfession }: ConfessionFormProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remaining = MAX_CHARS - text.length;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const ok = onAddConfession(text);
    if (!ok) {
      setError('Confession cannot be empty.');
      return;
    }

    setError('');
    setText('');
    textareaRef.current?.focus();
  }

  return (
    <form className="confession-form" onSubmit={handleSubmit}>
      <div className="textarea-wrapper">
        <label htmlFor="confession-input" className="sr-only">
          Your confession
        </label>
        <textarea
          id="confession-input"
          ref={textareaRef}
          className="confession-textarea"
          placeholder="Drop your truth..."
          maxLength={MAX_CHARS + 20}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError('');
          }}
          rows={4}
        />
        <span
          className={`char-counter ${remaining <= 0 ? 'over' : ''}`}
          aria-live="polite"
          aria-label={`${remaining} characters remaining`}
        >
          {remaining}
        </span>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button
        type="submit"
        className="submit-btn"
        disabled={text.trim().length === 0}
      >
        Confess
      </button>
    </form>
  );
}
```

---

## 3. Performance: What happens with 10,000 confessions?

### The worry

This app stores everything in memory (`useConfessions.ts:5` — `useState<Confession[]>([])`).
Every confession ever submitted stays in the array. If thousands of people use it, the feed
will contain thousands of cards, all rendered at once. The page could get slow, laggy, or
crash the browser tab.

### How bad is it?

Each confession is stored as an object:

```ts
{ id: number, text: string (<= 280 chars), timestamp: Date }
```

That's maybe 500 bytes per confession. 10,000 confessions is ~5 MB in memory — the browser
can handle that. The real cost is **DOM nodes**: 10,000 `<article>` elements, each with a
`<p>` and a `<time>`, plus CSS box shadows and borders. The browser has to lay out, paint,
and manage all of them.

At around 500-1000 cards, you'll start noticing:
- Longer scroll interaction (the browser strains to manage the DOM).
- Higher memory usage.
- Slower initial render if the page loads with that many pre-populated.

### Fix 1 — Virtualization (windowed rendering)

Only render the confessions that are visible in the viewport, plus a small buffer above and
below. Use a library like `react-window` or `@tanstack/virtual`.

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// In ConfessionFeed:
const parentRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: confessions.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 100, // approximate card height in px
});

return (
  <section className="confession-feed" ref={parentRef}>
    <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
      {virtualizer.getVirtualItems().map((virtualItem) => (
        <div
          key={confessions[virtualItem.index].id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualItem.start}px)`,
          }}
        >
          <ConfessionCard confession={confessions[virtualItem.index]} />
        </div>
      ))}
    </div>
  </section>
);
```

This keeps the DOM at roughly 20-30 cards regardless of whether there are 100 or 100,000
confessions.

### Fix 2 — Cap the list

If the app is intentionally ephemeral (session-only, no backend), cap the stored confessions
at a reasonable number like 500.

In `useConfessions.ts`:

```ts
setConfessions((prev) => {
  const next = [newConfession, ...prev];
  return next.length > 500 ? next.slice(0, 500) : next;
});
```

Or keep it outside the hot path:

```ts
setConfessions((prev) => [newConfession, ...prev].slice(0, 500));
```

### Fix 3 — Lazy time-ago updates

**Location:** `ConfessionCard.tsx:4-13`

`timeAgo` recalculates on every render. If a parent re-renders, every card calls
`Date.now()` and recomputes "2m ago" vs "3m ago." For a long list, this is wasted work
because only the freshest cards meaningfully change.

**Fix:** use a `useMemo` to only recompute when the timestamp actually changes (it never
does after creation, so this runs exactly once per card):

```tsx
const timeAgoText = useMemo(() => timeAgo(confession.timestamp), [confession.timestamp]);
```

Or accept the tiny cost — for lists under 500, the recomputation is negligible.

### Verdict

| Scenario | Risk | Action |
|----------|------|--------|
| < 100 confessions | None | No action needed |
| 100–500 | Low | Consider the cap fix (Fix 2) |
| 500–5000 | Medium | Add virtualization (Fix 1) or a cap |
| 5000+ | High | Must virtualize |

For the current scope (session-only, no backend, one user or a small group), the cap fix
alone is sufficient.

---

## 4. Anti-patterns: Things that could be better

### Anti-pattern 1 — `MAX_CHARS + 20` as `maxLength`

**Location:** `ConfessionForm.tsx:38`

```tsx
maxLength={MAX_CHARS + 20}
```

**Why it's there:** The real character limit is 280, enforced by the red counter and the
submit button. The `+20` buffer lets users paste text that exceeds 280 without having it
silently truncated at the paste boundary — the counter turns red and they can edit it down.

**Why it's fuzzy:** There's a gap between what the browser allows (300) and what the UI
considers valid (280). A user could paste 295 characters, see a green counter, and be
confused when the counter says "15" but the textarea lets them type more.

**Better approach:** Keep `maxLength` at 280 and, on paste, trim the pasted text to
280:

```tsx
onChange={(e) => {
  if (e.target.value.length > MAX_CHARS) {
    setText(e.target.value.slice(0, MAX_CHARS));
  } else {
    setText(e.target.value);
  }
  if (error) setError('');
}}
```

This is cleaner: the browser blocks anything beyond 280, and the paste is truncated
predictably. The counter never shows a negative number.

### Anti-pattern 2 — State update is not batched in an obvious way

**Location:** `ConfessionForm.tsx:26-28`

```tsx
setError('');
setText('');
textareaRef.current?.focus();
```

React 18+ batches state updates inside event handlers, so these two `setXxx` calls
trigger a single re-render. This is correct, but if someone unfamiliar with React 18
reads this, they might think it triggers two renders.

**No fix needed** — this is actually good code. Just know that React batches them for
you, and the focus call is a side effect that runs after the state updates.

### Anti-pattern 3 — `useCallback` with empty deps is fine but subtle

**Location:** `useConfessions.ts:7,19`

```ts
const addConfession = useCallback((text: string): boolean => {
  // ... uses setConfessions ...
}, []);
```

The empty dependency array `[]` is correct because `setConfessions` (returned by
`useState`) has a stable identity — it never changes between renders. But a reader might
worry that `addConfession` captures stale closures.

**It doesn't.** Because we use the functional updater form `setConfessions((prev) => ...)`
on line 17, we always get the latest state without depending on it. This is a correct
pattern.

### Anti-pattern 4 — No `aria-label` on decorative elements

**Location:** `App.tsx:12-13`

```tsx
<h1>Confession Cathedral</h1>
<p className="app-subtitle">Drop your truth.</p>
```

These are fine — they're visible text that screen readers can read. No fix needed.

### Anti-pattern 5 — `Date.now()` for IDs without collision check

**Location:** `useConfessions.ts:12`

```ts
id: Date.now(),
```

`Date.now()` returns milliseconds since 1970. If two confessions are submitted within the
same millisecond, they'd share an ID. In practice this is nearly impossible for a human
user, but programmatic submissions could trigger it.

**Fix:** add a counter to guarantee uniqueness:

```ts
// At module scope (outside the hook):
let nextId = 1;

// Inside addConfession:
id: nextId++,
```

Or use `crypto.randomUUID()` if the browser supports it:

```ts
id: crypto.randomUUID(),
```

This returns a string like `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` that's guaranteed
unique.

### Anti-pattern 6 — Textarea `onChange` recreates the arrow function on every keystroke

**Location:** `ConfessionForm.tsx:40-43`

```tsx
onChange={(e) => {
  setText(e.target.value);
  if (error) setError('');
}}
```

An inline arrow function is created on every render. For a form input, this is completely
fine — the cost is negligible and React handles it efficiently. No fix needed. Just be aware
that if this were a performance-critical callback passed through many component layers, you'd
want to extract it with `useCallback`.

### Verdict

| Anti-pattern | Lines | Severity | Fix? |
|--------------|-------|----------|------|
| `MAX_CHARS + 20` maxLength | `ConfessionForm.tsx:38` | Low | Yes — trim to 280 on paste |
| Non-obvious batching | `ConfessionForm.tsx:26-28` | None | No fix needed |
| `useCallback([])` subtlety | `useConfessions.ts:7,19` | None | No fix needed (correct) |
| Missing aria-label on decorative elements | `App.tsx:12-13` | None | No fix needed |
| `Date.now()` ID collision | `useConfessions.ts:12` | Minimal | Optional — use `crypto.randomUUID()` |
| Inline arrow in onChange | `ConfessionForm.tsx:40-43` | None | No fix needed |

---

## Action Summary

| Priority | What | Where | Effort |
|----------|------|-------|--------|
| High | Add `<label htmlFor>` and `sr-only` class | `ConfessionForm.tsx:34-45`, `index.css` | 5 min |
| Medium | Add `aria-live` to character counter | `ConfessionForm.tsx:46-50` | 1 min |
| Medium | Add `role="alert"` to error message | `ConfessionForm.tsx:52` | 1 min |
| Low | Fix `maxLength` to 280 and trim on paste | `ConfessionForm.tsx:38,40-43` | 5 min |
| Low | Add a list cap (500) or virtualization | `useConfessions.ts:17` | 10 min |
| Optional | Use `crypto.randomUUID()` for IDs | `useConfessions.ts:12` | 2 min |
| Optional | Add `useMemo` for timeAgo | `ConfessionCard.tsx:22` | 2 min |

None of the issues are critical. React's JSX escaping already protects against XSS,
and the form works for most users. The accessibility fixes make the app usable by
everyone, and the list cap / virtualization keeps it fast as it grows.
