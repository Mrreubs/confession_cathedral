# Lie Detector: Five Statements About Confession Cathedral

## The Statements

**A.** The textarea uses a controlled input pattern — React owns the value through the
`value` prop and updates it via `onChange`.

**B.** New confessions are prepended to the list so the newest entry always appears
at the top of the feed.

**C.** The character counter turns red when the remaining characters drop to zero
or below, using a CSS class toggled by JavaScript.

**D.** Confessions stored in localStorage have a 24-hour time-to-live (TTL) — entries
older than one day are automatically removed when the page loads.

**E.** The fade-in animation on each confession card is defined with CSS `@keyframes`
and runs for 0.4 seconds with an ease-out timing function.

---

## The Lie

**Statement D is false.**

---

## How I Spotted It

I checked the `load()` and `save()` functions in `src/hooks/useConfessions.ts`.

The `save` function (lines 23-29) simply serializes the entire array to JSON and
writes it to localStorage with `setItem`. No timestamp metadata is stored, no expiry
field is written:

```ts
function save(confessions: Confession[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(confessions));
  } catch {
    // Storage full or unavailable — silently ignore.
  }
}
```

The `load` function (lines 7-21) reads the raw JSON, parses it, validates it's an
array, and maps each entry through a simple type-coercion constructor. No date
comparison, no expiry check, no filtering of old entries:

```ts
function load(): Confession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((c: Record<string, unknown>) => ({
      id: String(c.id),
      text: String(c.text),
      timestamp: new Date(String(c.timestamp)),
    }));
  } catch {
    return [];
  }
}
```

The only removal mechanism in the entire codebase is the `MAX_CONFESSIONS = 500`
cap at line 5, which trims the array to the newest 500 entries with `.slice(0, 500)`
on every add. There is no time-based eviction, no TTL logic, and no expiry metadata
anywhere.

The other four statements are verifiably true:

- **A** — `ConfessionForm.tsx:65-66`: `value={text}` and `onChange={(e) => handleInput(e.target.value)}`. Classic React controlled input.
- **B** — `useConfessions.ts:48`: `setConfessions((prev) => [newConfession, ...prev].slice(...))`. The spread puts the new entry at index 0.
- **C** — `ConfessionForm.tsx:70`: ``` className={`char-counter ${remaining <= 0 ? 'over' : ''}`} ```. The `over` class triggers `color: #e05252` in CSS.
- **E** — `ConfessionCard.css:1-10,18`: `@keyframes fadeIn` from `opacity: 0` / `translateY(10px)` to `opacity: 1` / `translateY(0)`, applied with `animation: fadeIn 0.4s ease-out`.

---

## The AI's Answer

The AI that generated these statements intended **Statement D** as the lie. There is
no TTL mechanism — it sounds plausible (many caching systems use TTLs), but the
code stores confessions indefinitely with no expiration logic. The only cleanup is
the count-based cap of 500 entries.
