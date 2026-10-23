// helpers
const $ = (id) => document.getElementById(id);

const storage = {
  get(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
};

const pad = (n) => String(n).padStart(2, "0");

// theme
const SVG_ATTRS = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
const ICON_MOON = `<svg ${SVG_ATTRS}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`;
const ICON_SUN = `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>`;

const themeBtn = $("theme-toggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeBtn.innerHTML = theme === "dark" ? ICON_SUN : ICON_MOON;
}

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(storage.get("theme", prefersDark ? "dark" : "light"));

themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  storage.set("theme", next);
});

// greeting
let userName = storage.get("userName", "");

function getGreeting(hour) {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

function updateClock() {
  const now = new Date();
  $("clock").textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  $("date").textContent = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const greeting = getGreeting(now.getHours());
  $("greeting").textContent = userName ? `${greeting}, ${userName}` : greeting;
}

function showNameForm(show) {
  $("name-form").hidden = !show;
  $("change-name-btn").hidden = show;
  if (show) {
    $("name-input").value = userName;
    $("name-input").focus();
  }
}

$("change-name-btn").addEventListener("click", () => showNameForm(true));
$("cancel-name-btn").addEventListener("click", () => showNameForm(false));

$("name-form").addEventListener("submit", (e) => {
  e.preventDefault();
  userName = $("name-input").value.trim();
  storage.set("userName", userName);
  updateClock();
  showNameForm(false);
});

updateClock();
setInterval(updateClock, 1000);

// timer
const FOCUS_SECONDS = 25 * 60;
let remaining = FOCUS_SECONDS;
let timerId = null;

function renderTimer() {
  $("timer").textContent = `${pad(Math.floor(remaining / 60))}:${pad(remaining % 60)}`;
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
  $("start-btn").disabled = false;
}

function startTimer() {
  if (timerId !== null) return;
  if (remaining === 0) remaining = FOCUS_SECONDS;
  $("start-btn").disabled = true;
  timerId = setInterval(() => {
    remaining -= 1;
    renderTimer();
    if (remaining <= 0) {
      stopTimer();
      alert("Time's up! Take a short break.");
    }
  }, 1000);
}

function resetTimer() {
  stopTimer();
  remaining = FOCUS_SECONDS;
  renderTimer();
}

$("start-btn").addEventListener("click", startTimer);
$("stop-btn").addEventListener("click", stopTimer);
$("reset-btn").addEventListener("click", resetTimer);
renderTimer();

// tasks
let tasks = storage.get("tasks", []);
let editingId = null;

const saveTasks = () => storage.set("tasks", tasks);

function isDuplicate(text, ignoreId = null) {
  const normalized = text.toLowerCase();
  return tasks.some((t) => t.id !== ignoreId && t.text.toLowerCase() === normalized);
}

function showTaskError(message) {
  $("task-error").textContent = message;
}

function makeButton(label, className, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.className = className;
  btn.addEventListener("click", onClick);
  return btn;
}

function wrapActions(...buttons) {
  const div = document.createElement("div");
  div.className = "task-actions";
  buttons.forEach((b) => div.appendChild(b));
  return div;
}

function renderTasks() {
  const list = $("task-list");
  list.innerHTML = "";

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No tasks yet. Add one above!";
    list.appendChild(empty);
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark task as done");
    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });
    li.appendChild(checkbox);

    if (editingId === task.id) {
      const input = document.createElement("input");
      input.type = "text";
      input.className = "edit-input";
      input.value = task.text;
      input.maxLength = 100;
      li.appendChild(input);

      const saveBtn = makeButton("Save", "btn btn-primary btn-small", () => {
        const newText = input.value.trim();
        if (!newText) return showTaskError("Task cannot be empty.");
        if (isDuplicate(newText, task.id)) return showTaskError("That task already exists.");
        task.text = newText;
        editingId = null;
        showTaskError("");
        saveTasks();
        renderTasks();
      });
      const cancelBtn = makeButton("Cancel", "btn btn-ghost btn-small", () => {
        editingId = null;
        showTaskError("");
        renderTasks();
      });
      li.appendChild(wrapActions(saveBtn, cancelBtn));
      setTimeout(() => input.focus(), 0);
    } else {
      const span = document.createElement("span");
      span.className = "task-text";
      span.textContent = task.text;
      li.appendChild(span);

      const editBtn = makeButton("Edit", "btn btn-ghost btn-small", () => {
        editingId = task.id;
        showTaskError("");
        renderTasks();
      });
      const deleteBtn = makeButton("Delete", "btn btn-danger", () => {
        tasks = tasks.filter((t) => t.id !== task.id);
        saveTasks();
        renderTasks();
      });
      li.appendChild(wrapActions(editBtn, deleteBtn));
    }

    list.appendChild(li);
  });
}

$("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = $("task-input").value.trim();
  if (!text) return showTaskError("Please type a task first.");
  if (isDuplicate(text)) return showTaskError("That task already exists.");

  tasks.push({ id: Date.now(), text, done: false });
  saveTasks();
  showTaskError("");
  $("task-input").value = "";
  renderTasks();
});

renderTasks();

// quick links
const DEFAULT_LINKS = [
  { id: 1, name: "Google", url: "https://www.google.com" },
  { id: 2, name: "Gmail", url: "https://mail.google.com" },
  { id: 3, name: "Calendar", url: "https://calendar.google.com" },
];

let links = storage.get("links", DEFAULT_LINKS);
const saveLinks = () => storage.set("links", links);

function normalizeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function renderLinks() {
  const box = $("link-list");
  box.innerHTML = "";

  links.forEach((link) => {
    const chip = document.createElement("div");
    chip.className = "link-chip";

    const a = document.createElement("a");
    a.href = link.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = link.name;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${link.name}`);
    remove.addEventListener("click", () => {
      links = links.filter((l) => l.id !== link.id);
      saveLinks();
      renderLinks();
    });

    chip.append(a, remove);
    box.appendChild(chip);
  });
}

$("link-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("link-name").value.trim();
  const url = $("link-url").value.trim();
  if (!name || !url) return;

  links.push({ id: Date.now(), name, url: normalizeUrl(url) });
  saveLinks();
  $("link-name").value = "";
  $("link-url").value = "";
  renderLinks();
});

renderLinks();
