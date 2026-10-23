# Implementation Plan: To-Do Life Dashboard

## Overview

The To-Do Life Dashboard is implemented as three plain files (`index.html`, `css/style.css`, `js/script.js`) with zero external runtime dependencies. All tasks below reflect the **completed implementation** as it exists in the repository.

## Tasks

- [x] 1. Scaffold project structure and base HTML
  - `index.html` created with a centred `<div id="wrapper">` (max-width 960px) containing `<section id="greeting-card">` and `<div id="main-grid">` with `<div id="left-column">` holding `<section id="timer-card">` and `<section id="links-card">`, and `<section id="tasks-card">` as the right column.
  - `<link rel="stylesheet">` → `css/style.css`; `<script defer>` → `js/script.js`.
  - Inline base64 SVG favicon (< 1 KB) in `<head>`.
  - All static DOM elements present with correct `id`, `aria-label`, and `type="button"` attributes.
  - `<h2>` titles added: "Focus Timer", "Tasks", "Quick Links".
  - _Requirements: 1.1, 1.4, 5.1, 6.1, 9.1, 12.3, 12.6_

- [x] 2. Implement CSS foundation and layout
  - [x] 2.1 CSS custom properties and visual styles
    - `:root` variables: `--bg-card`, `--text-primary`, `--text-muted`, `--accent (#4f46e5)`, `--border`, `--shadow`, `--danger (#b91c1c)`.
    - Purple gradient body (`#667eea → #764ba2`), white cards with `border-radius: 12px` and `box-shadow`.
    - `h2`: `font-size: 1.05rem; font-weight: 600; color: var(--text-primary); margin-bottom: 16px`.
    - Section block comments: `/* greeting */`, `/* theme */`, `/* timer */`, `/* tasks */`, `/* links */`, `/* dark mode */`, `/* layout */` — each ≤ 15 chars.
    - _Requirements: 11.1–11.5, 12.5_
  - [x] 2.2 Centred wrapper and responsive two-column layout
    - `#wrapper`: `max-width: 960px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px`.
    - `#main-grid`: CSS Grid, `1fr 1fr`, `gap: 16px` at ≥ 700px.
    - `#timer-card`, `#links-card`, `#tasks-card`: `min-height: 240px`.
    - `#timer-card`: `display: flex; flex-direction: column; align-items: center; justify-content: center`.
    - Below 700px: `#main-grid` → flex column; `#left-column → display: contents`; CSS `order` 1/2/3 for timer/tasks/links; `#greeting-card` gets `padding-top: 64px`.
    - _Requirements: 10.1–10.5_

- [x] 3. Implement Greeting Card widget
  - [x] 3.1 JS skeleton and clock
    - IIFE wrapper, `'use strict'`, `DOMContentLoaded` listener calling all five inits.
    - `formatTime(date)` → zero-padded HH:MM:SS; `formatDate(date)` → en-US long date.
    - `tick()` updates `#clock` and `#date-display` via `textContent`, then calls `updateGreeting()`.
    - `startClock()` calls `tick()` immediately then `setInterval(tick, 1000)`.
    - Section comment: `// greeting`.
    - _Requirements: 1.1–1.4, 12.1, 12.4_
  - [x] 3.2 Greeting phrase
    - `getGreetingPhrase(hour, name)`: 0–11 → "Good Morning"; 12–17 → "Good Afternoon"; 18–20 → "Good Evening"; 21–23 → "Good Night"; appends `", " + name.trim()` when non-empty.
    - `updateGreeting()` reads `localStorage.userName` in `try/catch`, writes to `#greeting-phrase` via `textContent`.
    - Called on each `tick()` and on load.
    - _Requirements: 2.1–2.6, 12.1_

- [x] 4. Implement Name Form and Theme Toggle
  - [x] 4.1 Name form (`// name` section)
    - `initName()` wired inside `initGreeting()`.
    - "Change name" click → hides button, shows `#name-form`, prefills `#name-input` from `localStorage.userName`.
    - Form submit → trims input, writes to `localStorage.userName` in `try/catch`, calls `updateGreeting()`, closes form.
    - Cancel → closes form without changes.
    - _Requirements: 3.1–3.6, 12.1, 12.2_
  - [x] 4.2 Theme toggle (`// theme` section)
    - `initTheme()`: reads `localStorage.theme` → `prefers-color-scheme` fallback → defaults `"light"`.
    - `applyTheme(theme)`: sets `data-theme` on `<html>`, replaces SVG icon via `createElementNS` (no `innerHTML`), updates `aria-label`.
    - `toggleTheme()`: flips theme, calls `applyTheme`, persists in `try/catch`.
    - Dark mode: `html[data-theme="dark"]` overrides all custom properties. Body gradient changes to `#1a1a2e → #16213e`.
    - _Requirements: 4.1–4.6, 12.1, 12.2_

- [x] 5. Implement Focus Timer widget (`// timer` section)
  - Module-scoped `timerInterval = null` and `remainingSeconds = 1500`.
  - `renderTimer(s)` → MM:SS via `textContent`.
  - `setStartDisabled(bool)` → sets `btn.disabled` on `#start-btn`.
  - `startTimer()`: no-op if running; auto-resets to 1500 if `remainingSeconds <= 0`; starts interval; disables Start.
  - `stopTimer()`: clears interval, re-enables Start.
  - `resetTimer()`: calls `stopTimer()`, resets to 1500, re-renders.
  - `timerTick()`: decrements; at `<= 0` calls `stopTimer()` then `alert('Focus session complete!')`.
  - All three buttons have `type="button"` in HTML.
  - _Requirements: 5.2–5.10, 12.6_

- [x] 6. Implement Task List widget (`// tasks` section)
  - [x] 6.1 Data layer
    - `loadTasks()`: reads `localStorage.tasks` in `try/catch`; validates `Array.isArray`; returns `[]` on any error.
    - `saveTasks()`: writes in `try/catch`; swallows exceptions.
    - `isDuplicate(text, excludeId?)`: case-insensitive match against all tasks.
    - `genId()`: `crypto.randomUUID()` or `Date.now().toString(36)` fallback.
    - _Requirements: 6.7, 6.10, 8.4, 12.2_
  - [x] 6.2 Render and display
    - `renderTaskList()`: clears `#task-list`; shows empty-state message when `tasks.length === 0`; creates `<li data-id>` with checkbox, `<span class="task-text">`, Edit button, Delete button — all via DOM API with `textContent`.
    - `showTaskMsg(msg)` / `clearTaskMsg()` manage `#task-message` visibility.
    - `.task-done` CSS class applies strikethrough.
    - _Requirements: 6.6, 6.8, 6.9, 7.1, 7.2, 12.1_
  - [x] 6.3 Add, delete, toggle
    - `addTask()`: trim → empty guard → duplicate guard → push → `saveTasks()` → `renderTaskList()` → clear input.
    - `deleteTask(id)`: `confirm()` → filter → `saveTasks()` → `renderTaskList()`.
    - `toggleTask(id)`: flip `completed` → `saveTasks()` → `renderTaskList()`.
    - _Requirements: 6.3–6.5, 7.3–7.4_
  - [x] 6.4 Inline editing
    - `startEdit(id)`: replaces `<li>` content with `edit-input` (maxlength 200), Save/Cancel buttons (both `type="button"`); disables all other Edit buttons; focuses input.
    - `saveEdit(id, value)`: trim → empty guard → duplicate-against-others guard → update `tasks` → `saveTasks()` → `renderTaskList()`.
    - `cancelEdit()`: calls `renderTaskList()` to restore all rows.
    - Enter key → `saveEdit`; Escape key → `cancelEdit` via `keydown` on `edit-input`.
    - All dynamically created buttons carry `type="button"`.
    - _Requirements: 8.1–8.7, 12.6_
  - [x] 6.5 Event wiring in `initTasks()`
    - `loadTasks()` → `renderTaskList()`.
    - `#add-task-btn` click and `#task-input` Enter → `addTask()`.
    - Delegated click on `#task-list`: checkbox → `toggleTask`; `.edit-btn` → `startEdit`; `.delete-btn` → `deleteTask`.
    - _Requirements: 6.2, 12.4_

- [x] 7. Implement Quick Links widget (`// links` section)
  - [x] 7.1 Data layer
    - `DEFAULT_LINKS`: Google (`dl-1`), Gmail (`dl-2`), Calendar (`dl-3`).
    - `loadLinks()`: reads `localStorage.links` in `try/catch`; validates `Array.isArray`; returns `DEFAULT_LINKS.slice()` if absent, invalid, or non-array.
    - `saveLinks(snapshot)`: writes in `try/catch`; on failure restores `links = snapshot`, calls `renderLinkList()`, calls `showLinkMsg()`; returns `true`/`false`.
    - `normaliseUrl(url)`: returns url unchanged if starts with `http(s)://`; otherwise prepends `"https://"`.
    - _Requirements: 9.8, 9.9, 9.11, 12.2_
  - [x] 7.2 Render and mutate
    - `renderLinkList()`: clears `#link-list`; creates `.link-item` divs with `<a>` (href via `setAttribute`, name via `textContent`) and remove button (`type="button"`).
    - `addLink()`: guards empty fields (silent), 20-link cap (error msg), normalises URL; calls `saveLinks(snapshot)`; clears inputs only on success.
    - `removeLink(id)`: filter → `saveLinks(snapshot)` → `renderLinkList()`.
    - `initLinks()`: `loadLinks()` → `renderLinkList()`; wires `#add-link-btn` click; delegates `.remove-link-btn` click on `#link-list`.
    - _Requirements: 9.2–9.7, 9.10, 12.1, 12.6_

- [x] 8. Final wiring — `DOMContentLoaded` listener
  - Calls in order: `initTheme()`, `initGreeting()`, `initTimer()`, `initTasks()`, `initLinks()`.
  - `initGreeting()` calls `startClock()` and `initName()`.
  - Each init reads its own localStorage slice independently.
  - _Requirements: 1.2, 3.6, 4.3, 6.7, 9.9_

## Notes

- No test files, no package.json, no build tools are part of the shipped deliverable.
- All user-supplied and localStorage-sourced values are inserted via `textContent` — never `innerHTML`.
- All dynamically created `<button>` elements carry `type="button"`.
- CSS and JS each have exactly one section comment per logical area (≤ 15 chars each).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2"] },
    { "id": 3, "tasks": ["4.1", "4.2"] },
    { "id": 4, "tasks": ["5", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 6, "tasks": ["6.4", "6.5", "7.2"] },
    { "id": 7, "tasks": ["8"] }
  ]
}
```
