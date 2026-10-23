# Requirements Document

## Introduction

The To-Do List Life Dashboard is a browser-based personal productivity page built with HTML, CSS, and vanilla JavaScript. It organises the user's day through four widgets on a single page: a greeting card with live clock and date, a 25-minute focus timer, a to-do list, and a quick-links bar. All data is stored client-side via the Local Storage API. No backend server, build tool, or framework is required. The page is delivered as three plain files: `index.html` (root), `css/style.css`, and `js/script.js`.

Three extra challenges are included in scope: light/dark theme toggle, custom user name in the greeting, and duplicate-task prevention.

## Glossary

- **Dashboard**: The single HTML page that contains all four widgets.
- **Wrapper**: The `<div id="wrapper">` container (max-width 960 px, centred) that holds the Greeting_Card and the Main_Grid, keeping all cards aligned.
- **Greeting_Card**: The top card inside Wrapper that shows the live clock, date, greeting phrase, theme toggle button, and custom-name controls.
- **Clock**: The HH:MM:SS live display inside the Greeting_Card, updated every second.
- **Greeting_Phrase**: The time-of-day salutation shown in the Greeting_Card (e.g., "Good Morning, Budi").
- **Focus_Timer**: The 25-minute countdown widget with Start, Stop, and Reset controls, titled "Focus Timer".
- **Task_List**: The to-do list widget titled "Tasks" where users add, edit, complete, and delete tasks.
- **Task**: A single to-do item stored in Local Storage with text and completion state.
- **Quick_Links**: The widget titled "Quick Links" that displays user-defined website shortcut buttons.
- **Link**: A Quick_Link entry with a display name and a URL, stored in Local Storage.
- **Theme_Toggle**: The icon button in the top-right of the Greeting_Card that switches between light and dark mode.
- **Name_Form**: The inline form that appears when the user clicks "Change name", allowing them to set a custom name.
- **Local_Storage**: The browser's `localStorage` API used as the sole persistence layer.
- **System_Preference**: The operating-system dark/light mode reported by `prefers-color-scheme`.

---

## Requirements

### Requirement 1: Live Clock and Date Display

**User Story:** As a user, I want to see the current time and date at a glance, so that I can stay aware of the time without switching apps.

#### Acceptance Criteria

1. THE Clock SHALL display the current time in 24-hour HH:MM:SS format.
2. WHEN the Dashboard loads, THE Clock SHALL immediately display the current time read from the device clock.
3. WHEN one second elapses, THE Clock SHALL update the displayed time to reflect the new second without a page reload.
4. THE Greeting_Card SHALL display the current date formatted as the full weekday name, day, month name, and four-digit year in en-US locale (e.g., "Thursday, October 22, 2026").

---

### Requirement 2: Time-Based Greeting Phrase

**User Story:** As a user, I want a greeting that matches the time of day, so that the Dashboard feels personal and contextually appropriate.

#### Acceptance Criteria

1. WHEN the local hour is between 0 and 11 inclusive, THE Greeting_Phrase SHALL begin with "Good Morning".
2. WHEN the local hour is between 12 and 17 inclusive, THE Greeting_Phrase SHALL begin with "Good Afternoon".
3. WHEN the local hour is between 18 and 20 inclusive, THE Greeting_Phrase SHALL begin with "Good Evening".
4. WHEN the local hour is between 21 and 23 inclusive, THE Greeting_Phrase SHALL begin with "Good Night".
5. WHERE a custom name has been saved and is not empty or whitespace-only, THE Greeting_Phrase SHALL append a comma and the saved name (e.g., "Good Morning, Budi").
6. WHERE no custom name has been saved or the saved name is empty or whitespace-only, THE Greeting_Phrase SHALL display the time-of-day salutation alone with no comma or name appended.

---

### Requirement 3: Custom Name in Greeting

**User Story:** As a user, I want to set my name so that the greeting addresses me personally.

#### Acceptance Criteria

1. THE Greeting_Card SHALL display a "Change name" button when the Name_Form is not open.
2. WHEN the user activates the "Change name" button, THE Name_Form SHALL replace the "Change name" button and display a text input prefilled with the current saved name (if any), a Save button, and a Cancel button.
3. THE Name_Form input SHALL accept a maximum of 30 characters.
4. WHEN the user activates the Save button, THE Dashboard SHALL store the trimmed name in Local_Storage under the key "userName", update the Greeting_Phrase to include the name, and close the Name_Form.
5. WHEN the user activates the Cancel button, THE Dashboard SHALL close the Name_Form without modifying the saved name or the Greeting_Phrase.
6. WHEN the Dashboard loads and Local_Storage contains a "userName" value, THE Greeting_Phrase SHALL include the stored name.

---

### Requirement 4: Light/Dark Theme Toggle

**User Story:** As a user, I want to switch between light and dark themes, so that I can use the Dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL be an icon button (`type="button"`) positioned in the top-right corner of the Greeting_Card, using an inline SVG moon icon in light mode and an inline SVG sun icon in dark mode. No emoji is used.
2. WHEN the user clicks or keyboard-activates the Theme_Toggle, THE Dashboard SHALL switch to the opposite theme and save the new theme value ("light" or "dark") in Local_Storage under the key "theme".
3. WHEN the Dashboard loads and Local_Storage contains a "theme" value, THE Dashboard SHALL apply the stored theme.
4. WHEN the Dashboard loads and Local_Storage does not contain a "theme" value, THE Dashboard SHALL apply the theme that matches the System_Preference; if System_Preference is unavailable, THE Dashboard SHALL default to the light theme.
5. THE Dashboard SHALL use CSS custom properties for all theme-specific colors, overridden under the `html[data-theme="dark"]` selector. Dark mode accent color SHALL be `#818cf8`; danger color SHALL be `#f87171`.
6. IF Local_Storage is unavailable when the user activates the Theme_Toggle, THEN THE Dashboard SHALL switch the theme for the current session without persisting the preference.

---

### Requirement 5: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with a visible title, so that I can use the Pomodoro technique to stay focused.

#### Acceptance Criteria

1. THE Focus_Timer card SHALL display an `<h2>` heading "Focus Timer" above the time display.
2. WHEN the Dashboard loads, THE Focus_Timer SHALL display 25:00.
3. THE Focus_Timer SHALL display the remaining time in MM:SS format.
4. WHEN the user activates the Start button while the timer is stopped or paused, THE Focus_Timer SHALL begin counting down one second at a time from the currently displayed time. IF the display already shows 00:00, THE Focus_Timer SHALL reset to 25:00 before starting.
5. WHILE THE Focus_Timer is running, THE Start button SHALL be visually disabled (`disabled` attribute, greyed out, `cursor: not-allowed`) and not respond to activation.
6. WHEN the user activates the Stop button while the timer is running, THE Focus_Timer SHALL pause the countdown and re-enable the Start button.
7. WHEN the user activates the Stop button while the timer is not running, THE Focus_Timer SHALL take no action.
8. WHEN the user activates the Reset button, THE Focus_Timer SHALL stop the countdown, reset the display to 25:00, and re-enable the Start button.
9. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and re-enable the Start button.
10. WHEN the countdown reaches 00:00, THE Dashboard SHALL display a browser alert to notify the user.

---

### Requirement 6: To-Do List — Adding and Displaying Tasks

**User Story:** As a user, I want to add tasks to a list with a visible title, so that I can track what I need to do today.

#### Acceptance Criteria

1. THE Task_List card SHALL display an `<h2>` heading "Tasks" above the input area.
2. THE Task_List SHALL display an input field (maximum 100 characters) and an Add button (`type="button"`) for creating new tasks.
3. WHEN the user activates the Add button and the input is empty or contains only whitespace, THE Task_List SHALL display the message "Please type a task first." without adding a Task.
4. WHEN the user activates the Add button and the input contains text that does not match any existing Task text case-insensitively, THE Task_List SHALL add the new Task, clear the input, and save all tasks to Local_Storage under the key "tasks".
5. WHEN the user activates the Add button and the input contains text that matches an existing Task text case-insensitively, THE Task_List SHALL display the message "That task already exists." without adding a duplicate Task.
6. WHEN no tasks exist, THE Task_List SHALL display the message "No tasks yet. Add one above!".
7. WHEN the Dashboard loads and Local_Storage contains a "tasks" value, THE Task_List SHALL restore and render all previously saved tasks.
8. WHEN a Task is rendered, THE Task_List SHALL display a checkbox, the Task's text, an Edit button (`type="button"`), and a Delete button (`type="button"`) for that Task.
9. THE Task_List SHALL display tasks in the order they were added, with the most recently added Task appearing last.
10. IF the Dashboard loads and Local_Storage contains a "tasks" value that cannot be parsed or is not a JSON array, THEN THE Task_List SHALL render an empty list and display the message "No tasks yet. Add one above!".

---

### Requirement 7: To-Do List — Completing and Deleting Tasks

**User Story:** As a user, I want to mark tasks as done and remove tasks, so that I can keep my list up to date.

#### Acceptance Criteria

1. WHEN the user checks the checkbox of a Task, THE Task_List SHALL apply a strikethrough style to the task text and save the updated state to Local_Storage.
2. WHEN the user unchecks the checkbox of a completed Task, THE Task_List SHALL remove the strikethrough style and restore the default incomplete-task appearance, and save the updated state to Local_Storage.
3. WHEN the user activates the Delete button of a Task, THE Dashboard SHALL display a browser `confirm()` prompt asking the user to confirm deletion.
4. WHEN the user confirms the deletion prompt, THE Task_List SHALL remove that Task from the list and from Local_Storage.

---

### Requirement 8: To-Do List — Inline Editing

**User Story:** As a user, I want to edit a task's text in place, so that I can correct or update tasks without deleting and re-adding them.

#### Acceptance Criteria

1. WHEN the user activates the Edit button of a Task, THE Task_List SHALL replace the task text with an inline input field (`type="text"`, `maxlength="200"`) prefilled with the current text, replace the Edit and Delete buttons with Save (`type="button"`) and Cancel (`type="button"`) buttons, and disable the Edit buttons of all other Tasks.
2. IF the user activates the Save button during inline editing and the input is empty or contains only whitespace, THEN THE Task_List SHALL display the message "Task cannot be empty." without saving the change or exiting the editing view.
3. IF the user activates the Save button during inline editing and the trimmed input text matches a different existing Task's text case-insensitively, THEN THE Task_List SHALL display the message "That task already exists." without saving the change or exiting the editing view.
4. IF the user activates the Save button during inline editing and the trimmed input is non-empty and does not match any different existing Task's text case-insensitively, THEN THE Task_List SHALL update the Task text to the trimmed input, restore the non-editing view, re-enable all Edit buttons, and save all tasks to Local_Storage.
5. WHEN the user activates the Cancel button during inline editing, THE Task_List SHALL restore the original task text, restore the non-editing view, and re-enable all Edit buttons without modifying Local_Storage.
6. WHEN the user presses Enter during inline editing, THE Dashboard SHALL behave identically to activating the Save button.
7. WHEN the user presses Escape during inline editing, THE Dashboard SHALL behave identically to activating the Cancel button.

---

### Requirement 9: Quick Links

**User Story:** As a user, I want to save and open favorite website shortcuts under a visible title, so that I can reach my most-used sites with one click.

#### Acceptance Criteria

1. THE Quick_Links card SHALL display an `<h2>` heading "Quick Links" above the form.
2. THE Quick_Links widget SHALL display a form with a Link name input (maximum 20 characters), a URL input (maximum 2048 characters), and an Add Link button (`type="button"`).
3. IF the user activates the Add Link button and either the Link name or URL input is empty, THEN THE Quick_Links widget SHALL ignore the submission without adding a Link.
4. IF the user activates the Add Link button with both fields filled and the URL does not begin with "http://" or "https://", THEN THE Quick_Links widget SHALL prepend "https://" to the URL before saving the Link.
5. WHEN the user activates the Add Link button with both fields filled and the save to Local_Storage succeeds, THE Quick_Links widget SHALL add the Link, clear both inputs, and save all links to Local_Storage under the key "links".
6. THE Quick_Links widget SHALL render each Link as an `<a>` element that opens the associated URL in a new browser tab with `rel="noopener noreferrer"`.
7. THE Quick_Links widget SHALL render a remove button (`type="button"`) alongside each Link to delete that Link from the list and from Local_Storage.
8. WHEN the Dashboard loads for the first time and Local_Storage contains no "links" value, THE Quick_Links widget SHALL populate the list with three default links: Google (https://google.com), Gmail (https://mail.google.com), and Calendar (https://calendar.google.com).
9. WHEN the Dashboard loads and Local_Storage contains a "links" value, THE Quick_Links widget SHALL restore and render all previously saved links. IF the stored value is not a valid JSON array, THE widget SHALL fall back to the default links.
10. IF the user activates the Add Link button and the total number of saved links is already 20, THEN THE Quick_Links widget SHALL not add the Link and SHALL display an error message indicating the maximum link limit has been reached.
11. IF saving to Local_Storage fails when a Link is added or removed, THEN THE Quick_Links widget SHALL display an error message, revert the in-memory list to its pre-operation state, and re-render the list. Inputs are cleared only on a successful save.

---

### Requirement 10: Layout and Responsiveness

**User Story:** As a user, I want the Dashboard to adapt to my screen size with aligned cards, so that I can use it comfortably on any device.

#### Acceptance Criteria

1. THE Dashboard SHALL render all cards inside a centred Wrapper with `max-width: 960px`.
2. THE Greeting_Card SHALL be the first item inside the Wrapper, sharing the same width and horizontal padding (24px) as the cards below it.
3. THE Dashboard SHALL render the Focus_Timer card and Quick_Links card in the left column, and the Task_List card in the right column, as two equal-width columns with a gap of 16 px between them, below the Greeting_Card on screens 700 px wide or wider.
4. THE Focus_Timer card, Quick_Links card, and Task_List card SHALL each have a minimum height of 240 px. The Focus_Timer content (title, display, controls) SHALL be vertically centred within its card.
5. WHEN the viewport width is below 700 px, THE Dashboard SHALL switch to a single-column layout with card order: Greeting_Card, Focus_Timer, Task_List, Quick_Links. The Greeting_Card SHALL have a top padding of at least 48 px to prevent the Theme_Toggle button from overlapping the Clock.

---

### Requirement 11: Visual Design

**User Story:** As a user, I want a clean, attractive design, so that the Dashboard is pleasant to look at and easy to read.

#### Acceptance Criteria

1. THE Dashboard body SHALL apply a purple gradient background from `#667eea` to `#764ba2`.
2. THE Dashboard SHALL render all cards with a white (light mode) or dark (dark mode) background, `border-radius: 12px`, and a soft `box-shadow`.
3. THE Dashboard SHALL use a sans-serif font stack (`system-ui, -apple-system, 'Segoe UI', sans-serif`).
4. THE accent color SHALL be `#4f46e5` in light mode and `#818cf8` in dark mode, ensuring ≥ 4.5:1 contrast against their respective card backgrounds.
5. THE danger/error color SHALL be `#b91c1c` in light mode and `#f87171` in dark mode.
6. Each card SHALL display an `<h2>` section title (font-size 1.05rem, weight 600) except the Greeting_Card.

---

### Requirement 12: Data Safety and Code Quality

**User Story:** As a developer, I want the code to follow safety and quality standards, so that the Dashboard is secure, reliable, and maintainable.

#### Acceptance Criteria

1. THE Dashboard SHALL insert all values originating from user input or retrieved from Local_Storage into the DOM using `textContent`, never `innerHTML`.
2. THE Dashboard SHALL wrap every Local_Storage read and write operation in a `try/catch` block such that a caught exception leaves the Dashboard in its last valid state without throwing an uncaught error.
3. THE Dashboard SHALL include an inline favicon embedded as a base64 data URI of no more than 1 KB in the `<head>` element.
4. THE Dashboard SHALL mark each JavaScript feature section (greeting, timer, tasks, links, theme, name) with exactly one inline comment of no more than 15 characters (e.g., `// timer`).
5. THE Dashboard SHALL mark each CSS feature section (greeting, theme, timer, tasks, links, dark mode, layout) with exactly one block comment of no more than 15 characters (e.g., `/* timer */`).
6. ALL dynamically created `<button>` elements SHALL carry `type="button"` to prevent accidental form submission.
