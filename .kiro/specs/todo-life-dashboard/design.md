# Design Document: To-Do Life Dashboard

## Overview

The To-Do Life Dashboard is a zero-dependency, single-page web application delivered as three plain files: `index.html`, `css/style.css`, and `js/script.js`. It runs entirely in the browser with no build step and no server. All state is persisted in `localStorage`.

The page is divided into four widgets:

| Widget | Position | localStorage key |
|---|---|---|
| Greeting Card | Full-width, top of wrapper | `userName`, `theme` |
| Focus Timer | Left column, top | — |
| Quick Links | Left column, bottom | `links` |
| Task List | Right column, full height | `tasks` |

Design goals:
- **Pure vanilla** — zero external dependencies, no frameworks.
- **Safety first** — every localStorage access is wrapped in `try/catch`; all user-supplied content uses `textContent`, never `innerHTML`; all dynamically created buttons carry `type="button"`.
- **Accessible** — buttons carry `aria-label`, SVG icons are built with `createElementNS` (no `innerHTML`), color contrast ≥ 4.5:1 in both themes.
- **Aligned layout** — a centred `#wrapper` (max-width 960px) contains both the greeting card and the main grid so all card edges line up.

---

## Architecture

### File Structure

```
index.html          ← single HTML document, inline base64 favicon
css/
  style.css         ← all styles, CSS custom properties, dark-mode overrides
js/
  script.js         ← all JavaScript, IIFE-wrapped, no globals
```

### HTML Structure

```
<body>
  <div id="wrapper">            ← max-width 960px, centred
    <section id="greeting-card">
    <div id="main-grid">        ← CSS Grid, 2 cols ≥700px
      <div id="left-column">
        <section id="timer-card">
        <section id="links-card">
      </div>
      <section id="tasks-card">
  </div>
</body>
```

### Execution Model

```
Browser loads index.html
  └─ <link> loads css/style.css
  └─ <script defer> loads js/script.js
       └─ DOMContentLoaded listener fires
            ├─ initTheme()     — read theme from localStorage / prefers-color-scheme
            ├─ initGreeting()  — start clock, wire name form
            ├─ initTimer()     — render 25:00, wire buttons
            ├─ initTasks()     — load tasks, render list, wire events
            └─ initLinks()     — load links (or defaults), render list, wire events
```

### JS Section Comments (one per section, ≤ 15 chars)

```
// greeting
// timer
// tasks
// links
// theme
// name
```

### CSS Section Comments (one per section, ≤ 15 chars)

```
/* greeting */
/* theme */
/* timer */
/* tasks */
/* links */
/* dark mode */
/* layout */
```

---

## Components and Interfaces

### 1. Greeting Card

**DOM structure:**
```html
<section id="greeting-card" aria-label="Greeting">
  <div id="clock" aria-live="polite" aria-label="Current time">00:00:00</div>
  <div id="date-display" aria-label="Current date">…</div>
  <div id="greeting-phrase" aria-live="polite">Good Morning</div>
  <button id="theme-toggle" type="button" aria-label="Switch to dark mode"><!-- SVG --></button>
  <button id="change-name-btn" type="button">Change name</button>
  <form id="name-form" hidden aria-label="Change your name">
    <input id="name-input" maxlength="30" type="text" aria-label="Your name" placeholder="Enter your name…">
    <button type="submit">Save</button>
    <button type="button" id="cancel-name-btn">Cancel</button>
  </form>
</section>
```

**Key functions:**

| Function | Signature | Responsibility |
|---|---|---|
| `startClock()` | `() => void` | Calls `tick()` immediately, then `setInterval(tick, 1000)` |
| `tick()` | `() => void` | Reads `new Date()`, updates `#clock`, `#date-display`, calls `updateGreeting()` |
| `getGreetingPhrase(hour, name)` | `(number, string) => string` | Pure function — returns full greeting string |
| `updateGreeting()` | `() => void` | Reads current hour and stored name, sets `#greeting-phrase` via `textContent` |
| `formatDate(date)` | `(Date) => string` | Returns en-US long date string |
| `formatTime(date)` | `(Date) => string` | Returns zero-padded HH:MM:SS string |

**`getGreetingPhrase` logic:**
```
hour 0–11  → "Good Morning"
hour 12–17 → "Good Afternoon"
hour 18–20 → "Good Evening"
hour 21–23 → "Good Night"
+ ", {name.trim()}" if name.trim() is non-empty
```

### 2. Focus Timer

**DOM structure:**
```html
<section id="timer-card" aria-label="Focus timer">
  <h2>Focus Timer</h2>
  <div id="timer-display" aria-live="polite" aria-label="Timer display">25:00</div>
  <div id="timer-controls">
    <button id="start-btn" type="button" aria-label="Start timer">Start</button>
    <button id="stop-btn"  type="button" aria-label="Stop timer">Stop</button>
    <button id="reset-btn" type="button" aria-label="Reset timer">Reset</button>
  </div>
</section>
```

**State (module-scoped variables):**

| Variable | Type | Description |
|---|---|---|
| `timerInterval` | `number \| null` | Handle from `setInterval`; `null` when stopped |
| `remainingSeconds` | `number` | Seconds left; initialised to `1500` |

**Key functions:**

| Function | Responsibility |
|---|---|
| `renderTimer(s)` | Formats `s` as `MM:SS`, writes to `#timer-display` via `textContent` |
| `setStartDisabled(bool)` | Sets `btn.disabled` on `#start-btn` |
| `startTimer()` | Guard: no-op if running; guard: auto-reset if `remainingSeconds <= 0`; calls `setInterval(timerTick,1000)`, disables Start |
| `stopTimer()` | Clears interval, sets `timerInterval = null`, re-enables Start |
| `resetTimer()` | Calls `stopTimer()`, sets `remainingSeconds = 1500`, calls `renderTimer` |
| `timerTick()` | Decrements `remainingSeconds`, calls `renderTimer`; when `<= 0` calls `stopTimer()` then `alert()` |

### 3. Task List

**DOM structure (static shell):**
```html
<section id="tasks-card" aria-label="Task list">
  <h2>Tasks</h2>
  <div id="task-input-area">
    <input id="task-input" maxlength="100" type="text" placeholder="New task…" aria-label="New task">
    <button id="add-task-btn" type="button" aria-label="Add task">Add</button>
  </div>
  <p id="task-message" hidden aria-live="polite"></p>
  <ul id="task-list" aria-label="Tasks" aria-live="polite"></ul>
</section>
```

**Rendered task row:**
```html
<li data-id="{id}">
  <input type="checkbox" aria-label="Mark complete">
  <span class="task-text">Buy groceries</span>
  <button type="button" class="edit-btn"   aria-label="Edit task">Edit</button>
  <button type="button" class="delete-btn" aria-label="Delete task">Delete</button>
</li>
```

**Editing state:**
```html
<li data-id="{id}" class="task-done?">
  <input type="text" class="edit-input" maxlength="200" value="Buy groceries">
  <button type="button" class="save-edit-btn">Save</button>
  <button type="button" class="cancel-edit-btn">Cancel</button>
</li>
```

**Task data shape:**
```js
[{ id: string, text: string, completed: boolean }]
```

**Key functions:**

| Function | Responsibility |
|---|---|
| `loadTasks()` | Reads/parses `localStorage.tasks` in `try/catch`; validates `Array.isArray`; returns `[]` on any error |
| `saveTasks()` | Serialises `tasks` array and writes to `localStorage.tasks` in `try/catch`; swallows exceptions |
| `genId()` | Returns `crypto.randomUUID()` or `Date.now().toString(36) + random` fallback |
| `isDuplicate(text, excludeId?)` | Case-insensitive match against all tasks, optionally excluding one by id |
| `renderTaskList()` | Clears `#task-list`, creates `<li>` per task; shows empty-state message when array is empty |
| `addTask()` | Reads `#task-input`, validates (empty, duplicate), pushes task, saves, re-renders, clears input |
| `deleteTask(id)` | `confirm()` → removes from array → saves → re-renders |
| `toggleTask(id)` | Flips `completed` flag → saves → re-renders |
| `startEdit(id)` | Transforms `<li>` to edit mode; disables other Edit buttons; focuses `edit-input` |
| `saveEdit(id, value)` | Validates (empty, duplicate-against-others), updates task, saves, re-renders |
| `cancelEdit()` | Re-renders from current task data (restores all rows) |
| `showTaskMsg(msg)` | Sets `#task-message` textContent, removes `hidden` |
| `clearTaskMsg()` | Sets `#task-message` `hidden` |

**Event delegation on `#task-list`:**
```
click → checkbox   → toggleTask(id)
click → .edit-btn  → startEdit(id)
click → .delete-btn → deleteTask(id)
```
Save/Cancel buttons attach their own listeners inside `startEdit()`.
Enter key → `saveEdit`; Escape key → `cancelEdit` via `keydown` on `edit-input`.

### 4. Quick Links

**DOM structure (static shell):**
```html
<section id="links-card" aria-label="Quick links">
  <h2>Quick Links</h2>
  <div id="link-form-area">
    <input id="link-name-input" maxlength="20" placeholder="Name" aria-label="Link name" type="text">
    <input id="link-url-input"  maxlength="2048" placeholder="https://…" aria-label="Link URL" type="url">
    <button id="add-link-btn" type="button" aria-label="Add link">Add Link</button>
  </div>
  <p id="link-message" hidden aria-live="polite"></p>
  <div id="link-list" aria-label="Saved links"></div>
</section>
```

**Rendered link item:**
```html
<div class="link-item" data-id="{id}">
  <a href="{url}" target="_blank" rel="noopener noreferrer">{name}</a>
  <button type="button" class="remove-link-btn" aria-label="Remove {name}">×</button>
</div>
```

**Link data shape:**
```js
[{ id: string, name: string, url: string }]
```

**Default links (ids: `dl-1`, `dl-2`, `dl-3`):**
```js
Google   → https://google.com
Gmail    → https://mail.google.com
Calendar → https://calendar.google.com
```

**Key functions:**

| Function | Responsibility |
|---|---|
| `loadLinks()` | Reads/parses `localStorage.links` in `try/catch`; validates `Array.isArray`; returns `DEFAULT_LINKS.slice()` on any error or missing key |
| `saveLinks(snapshot)` | Writes links in `try/catch`; on failure restores `links = snapshot`, re-renders, shows error; returns `true`/`false` |
| `normaliseUrl(url)` | Returns url unchanged if starts with `http(s)://`; otherwise prepends `"https://"` |
| `renderLinkList()` | Clears `#link-list`, creates `.link-item` divs; sets `href` via `setAttribute`, name via `textContent` |
| `addLink()` | Guards empty fields (silent), 20-link cap (error msg), normalises URL, pushes, calls `saveLinks`; clears inputs only on success |
| `removeLink(id)` | Filters array → `saveLinks` → re-renders |

---

## Data Models

### Task

```typescript
interface Task {
  id: string;        // crypto.randomUUID() or Date.now().toString(36) fallback
  text: string;      // trimmed, 1–100 chars
  completed: boolean;
}
```

### Link

```typescript
interface Link {
  id: string;   // crypto.randomUUID() or Date.now().toString(36) fallback
  name: string; // 1–20 chars
  url: string;  // always starts with http:// or https://
}
```

### localStorage Key Registry

| Key | Type | Owner |
|---|---|---|
| `"tasks"` | `JSON → Task[]` | Task List |
| `"links"` | `JSON → Link[]` | Quick Links |
| `"theme"` | `"light" \| "dark"` | Theme Toggle |
| `"userName"` | `string` | Greeting / Name Form |

---

## CSS Architecture

### Custom Properties (`:root` / `html[data-theme="dark"]`)

| Variable | Light | Dark |
|---|---|---|
| `--bg-card` | `#ffffff` | `#1e1e2e` |
| `--text-primary` | `#1a1a2e` | `#e2e8f0` |
| `--text-muted` | `#6b7280` | `#94a3b8` |
| `--accent` | `#4f46e5` | `#818cf8` |
| `--border` | `#e5e7eb` | `#374151` |
| `--shadow` | `rgba(0,0,0,0.1)` | `rgba(0,0,0,0.4)` |
| `--danger` | `#b91c1c` | `#f87171` |

### Layout

- `body`: purple gradient `#667eea → #764ba2`, `padding: 16px`
- `#wrapper`: `max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px`
- `#main-grid`: `display: grid; grid-template-columns: 1fr 1fr; gap: 16px` (≥ 700px)
- `#left-column`: `display: flex; flex-direction: column; gap: 16px`
- `section`: `background: var(--bg-card); border-radius: 12px; box-shadow: 0 4px 20px var(--shadow); padding: 24px`
- `#timer-card`: `display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 240px`
- `#tasks-card`, `#links-card`: `min-height: 240px`

### Responsive (< 700px)

- `#greeting-card`: `padding-top: 64px` (prevents toggle overlapping clock)
- `#main-grid`: switches to `display: flex; flex-direction: column`
- `#left-column`: `display: contents` (flattens children into flex flow)
- Card order via CSS `order`: timer=1, tasks=2, links=3

---

## Correctness Properties

### Property 1: Greeting phrase covers all hours
*For any* integer hour 0–23, `getGreetingPhrase(hour, "")` returns a string starting with exactly one of the four salutations. **Validates: Req 2.1–2.4**

### Property 2: Name inclusion in greeting phrase
*For any* hour 0–23 and any non-empty, non-whitespace-only name, `getGreetingPhrase(hour, name)` returns a string ending with `", " + name.trim()`. **Validates: Req 2.5**

### Property 3: Whitespace name is treated as absent
*For any* hour 0–23 and any whitespace-only string, `getGreetingPhrase(hour, ws)` equals `getGreetingPhrase(hour, "")`. **Validates: Req 2.6**

### Property 4: Task addition grows the list by one
*For any* task list and a unique non-whitespace description, `addTask()` results in `tasks.length === original + 1`. **Validates: Req 6.4**

### Property 5: Duplicate task rejection preserves list
*For any* task list with ≥ 1 task, `addTask()` with a case-insensitive duplicate leaves the list unchanged. **Validates: Req 6.5**

### Property 6: Task round-trip serialisation
`loadTasks()` after `saveTasks()` returns an array deeply equal to the original. **Validates: Req 6.7, 6.10**

### Property 7: URL normalisation idempotence
`normaliseUrl(url)` returns `url` unchanged when it already starts with `http://` or `https://`. **Validates: Req 9.4**

### Property 8: URL normalisation prepends https
`normaliseUrl(url)` returns `"https://" + url` when `url` has no http(s) prefix. **Validates: Req 9.4**

### Property 9: Link list cap enforcement
*For any* link list of length 20, `addLink()` leaves the list at exactly 20 items. **Validates: Req 9.10**

### Property 10: isDuplicate case symmetry
`isDuplicate(A)` on a list containing B equals `isDuplicate(B)` on a list containing A, when A and B are equal after case-folding. **Validates: Req 6.5, 8.3**

---

## Error Handling

| Operation | On failure | User-visible effect |
|---|---|---|
| `loadTasks()` | Returns `[]` | Empty list; empty-state message shown |
| `saveTasks()` | Swallows exception | Data not persisted; UI unchanged |
| `loadLinks()` | Returns `DEFAULT_LINKS` | Default links shown |
| `saveLinks()` | Reverts `links`, re-renders, shows error in `#link-message` | Error message visible; list reverted |
| `localStorage.setItem('theme', …)` | Swallowed | Theme switches for session only |
| `localStorage.setItem('userName', …)` | Swallowed | Name updates for session only |
| Non-array JSON in `localStorage.tasks` | `Array.isArray` check → `[]` | Same as missing key |
| Non-array JSON in `localStorage.links` | `Array.isArray` check → `DEFAULT_LINKS` | Same as missing key |
| `startTimer()` at `remainingSeconds <= 0` | Auto-reset to 1500 before starting | Timer resets to 25:00, then starts |
