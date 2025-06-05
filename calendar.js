// === Constants and DOM Elements ===
const date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
let selectedDate = "";

const monthsName = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const toDoListObj = JSON.parse(localStorage.getItem("schedule")) || {};

const DOM = {
  prev: document.getElementById("prev"),
  next: document.getElementById("next"),
  monthTabs: document.querySelectorAll('.month-tab'),
  days: document.getElementById("days"),
  dayEvent: document.getElementById("day-event"),
  taskInput: document.getElementById("task-input"),
  categorySelect: document.getElementById("category-select"),
  submitBtn: document.getElementById("submit-btn"),
  currentMonth: document.getElementById("current-month"),
  yearEl: document.getElementById("year"),
  toggleBtn: document.getElementById("dark-mode-toggle"),
  searchInput: document.getElementById("task-search"),
  modal: document.getElementById("modal"),
  hideModal: document.getElementById("hide-modal")
};

// === Utility Functions ===
const saveToLocalStorage = () => {
  localStorage.setItem("schedule", JSON.stringify(toDoListObj));
};

const formatDate = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// === Calendar Rendering ===
const displayCalendar = () => {
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();
  let daysHTML = "";

  // Previous month's padding
  for (let i = 0; i < startDay; i++) {
    daysHTML += `<div class="prevDay"></div>`;
  }

  for (let day = 1; day <= lastDate; day++) {
    const dateStr = formatDate(year, month, day);
    const isToday = dateStr === formatDate(...[...new Date().toISOString().split("T")[0].split("-")].map(Number).map((v, i) => i === 1 ? v - 1 : v));
    const classes = `day${isToday ? " active" : ""}`;
    const dots = ["work", "personal", "ministry"]
      .filter(cat => toDoListObj[dateStr]?.[cat]?.length)
      .map(cat => `<span class="dot ${cat}s"></span>`)
      .join("");

    daysHTML += `<div class="${classes}">${day}${dots}</div>`;
  }

  DOM.days.innerHTML = daysHTML;
  DOM.currentMonth.textContent = monthsName[month].toUpperCase();
  DOM.yearEl.textContent = year;

  DOM.monthTabs.forEach(tab => {
    tab.classList.toggle('active', tab.textContent === monthsName[month]);
  });
};

// === Task Rendering ===
const renderTasks = () => {
  ["work", "personal", "ministry"].forEach(category => {
    const ul = document.getElementById(category);
    const tasks = toDoListObj[selectedDate]?.[category] || [];

    ul.innerHTML = tasks.length
      ? tasks.map((task, i) => `
          <li>
            <input type="checkbox"> ${task}
            <button class="delete-btn" data-cat="${category}" data-index="${i}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </li>`).join("")
      : `<div class="no-list">📝 No to do list, add one</div>`;
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const { cat, index } = btn.dataset;
      toDoListObj[selectedDate][cat].splice(index, 1);
      saveToLocalStorage();
      renderTasks();
      displayCalendar();
    });
  });
};

// === Event Handlers ===
const handleDayClick = e => {
  if (!e.target.classList.contains("day")) return;

  document.querySelectorAll(".day").forEach(d => d.classList.remove("active"));
  e.target.classList.add("active");

  const day = parseInt(e.target.textContent);
  selectedDate = formatDate(year, month, day);
  DOM.dayEvent.textContent = `${day} ${monthsName[month]} ${year}`;

  if (!toDoListObj[selectedDate]) {
    toDoListObj[selectedDate] = { work: [], personal: [], ministry: [] };
  }

  renderTasks();
};

const handleTaskSubmit = e => {
  e.preventDefault();
  const task = DOM.taskInput.value.trim();
  const category = DOM.categorySelect.value;

  if (!task || !category) return alert("Please fill all the fields");

  if (!toDoListObj[selectedDate]) {
    toDoListObj[selectedDate] = { work: [], personal: [], ministry: [] };
  }

  toDoListObj[selectedDate][category].push(task);
  saveToLocalStorage();
  DOM.taskInput.value = "";
  DOM.categorySelect.value = "";
  renderTasks();
  displayCalendar();
};

const handleSearch = () => {
  const input = DOM.searchInput.value.toLowerCase();
  if (!input) return DOM.modal.classList.add("hidden");

  for (const date in toDoListObj) {
    for (const category of ["work", "personal", "ministry"]) {
      const task = toDoListObj[date][category].find(t => t.toLowerCase().includes(input));
      if (task) {
        const [y, m, d] = date.split("-");
        DOM.modal.innerHTML = `<p>Your task "${task}" is on ${d} ${monthsName[+m - 1]} ${y}</p>`;
        DOM.modal.classList.remove("hidden");
        return;
      }
    }
  }

  DOM.modal.classList.add("hidden");
};

// === Initialization ===
DOM.prev.addEventListener("click", () => {
  month = (month - 1 + 12) % 12;
  if (month === 11) year--;
  displayCalendar();
});

DOM.next.addEventListener("click", () => {
  month = (month + 1) % 12;
  if (month === 0) year++;
  displayCalendar();
});

DOM.monthTabs.forEach(tab => {
  tab.addEventListener("click", e => {
    month = monthsName.indexOf(e.target.textContent);
    displayCalendar();
  });
});

DOM.days.addEventListener("click", handleDayClick);
DOM.submitBtn.addEventListener("click", handleTaskSubmit);
DOM.searchInput.addEventListener("input", handleSearch);

DOM.toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  DOM.toggleBtn.textContent = document.body.classList.contains("dark-mode")
    ? ☀️ Light Mode' : '🌙 Dark Mode';
});

window.addEventListener("load", () => {
  document.getElementById("spinner").style.display = "none";
  displayCalendar();
});
