
// Firebase Authentication and Firestore Integration
let currentUserId = null;

// Sign in with Google
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(result => {
      currentUserId = result.user.uid;
      loadTasksFromFirestore();
    })
    .catch(error => console.error("Sign-in error:", error));
}

// Sign out
function signOutUser() {
  auth.signOut().then(() => {
    currentUserId = null;
    console.log("Signed out");
  });
}

window.signInWithGoogle = signInWithGoogle;
window.singOutUser= singOutUser;

auth.onAuthStateChanged(user => {
  if (user) {
    currentUserId = user.uid;
    loadTasksFromFirestore();
  }
});

const date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
const monthsName = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const monthUl = document.getElementById("month");
const tabs = document.querySelectorAll('.month-tab');
const days = document.getElementById("days");
const dayEvent = document.getElementById("day-event");
const taskInput = document.getElementById("task-input");
const categorySelect = document.getElementById("category-select");
const submitBtn = document.getElementById("submit-btn");
const currentMonthEl = document.getElementById("current-month");

const toDoListObj = {};
let selectedDate = "";

const saveToFirestore = () => {
  if (!currentUserId) return;
  db.collection("users").doc(currentUserId).set(toDoListObj)
    .then(() => console.log("Data saved to Firestore"))
    .catch(error => console.error("Error saving:", error));
};

const loadTasksFromFirestore = () => {
  if (!currentUserId) return;
  db.collection("users").doc(currentUserId).get()
    .then(doc => {
      if (doc.exists) {
        Object.assign(toDoListObj, doc.data());
        displayCalendar();
        renderTasks();
      }
    })
    .catch(error => console.error("Error loading:", error));
};

const displayCalendar = () => {
  let daysEl = "";
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  const lastDayOfLastMonth = new Date(year, month, 0).getDay();
  const yearEl = document.getElementById("year");

  for (let h = 0; h <= lastDayOfLastMonth; h++) {
    daysEl += `<div class="prevDay">${h}</div>`;
  }

  for (let i = 1; i <= lastDateOfMonth; i++) {
    const isToday = year === new Date().getFullYear() &&
                    month === new Date().getMonth() &&
                    i === new Date().getDate();

    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    let dayClass = "day";
    if (isToday) dayClass += " active";

    let dots = "";
    if (toDoListObj[dateStr]) {
      if (toDoListObj[dateStr].work.length > 0) dots += `<span class="dot works"></span>`;
      if (toDoListObj[dateStr].personal.length > 0) dots += `<span class="dot personals"></span>`;
      if (toDoListObj[dateStr].ministry.length > 0) dots += `<span class="dot ministries"></span>`;
    }

    daysEl += `<div class="${dayClass}">${i}${dots}</div>`;
  }

  days.innerHTML = daysEl;
  currentMonthEl.textContent = monthsName[month].toUpperCase();
  yearEl.textContent = year;

  tabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.textContent === monthsName[month]) {
      tab.classList.add('active');
    }
  });
};

const findDay = (e) => {
  if (e.target.classList.contains("day")) {
    document.querySelectorAll(".day").forEach(d => d.classList.remove("active"));
    e.target.classList.add("active");
    const day = e.target.textContent;
    selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    dayEvent.textContent = `${day} ${monthsName[month]} ${year}`;

    if (!toDoListObj[selectedDate]) {
      toDoListObj[selectedDate] = { work: [], personal: [], ministry: [] };
    }
    renderTasks();
  }
};

const listResult = (e) => {
  e.preventDefault();
  if (taskInput.value === "" || categorySelect.value === "") {
    alert("Please fill all the fields");
    return;
  }

  const category = categorySelect.value;
  const task = taskInput.value;

  if (!toDoListObj[selectedDate]) {
    toDoListObj[selectedDate] = { work: [], personal: [], ministry: [] };
  }

  toDoListObj[selectedDate][category].push(task);
  taskInput.value = "";
  categorySelect.value = "";

  saveToFirestore();
  renderTasks();
  displayCalendar();
};

const renderTasks = () => {
  ["work", "personal", "ministry"].forEach(category => {
    const ul = document.getElementById(category);
    ul.innerHTML = "";

    const tasks = toDoListObj[selectedDate]?.[category] || [];

    if (tasks.length === 0) {
      ul.innerHTML = `<div class="no-list">📝 No to do list, add one</div>`;
    } else {
      tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<input type="checkbox"> ${task} <button class="delete-btn"><i class="fa-solid fa-trash-can"></i></button>`;

        li.querySelector(".delete-btn").addEventListener("click", () => {
          toDoListObj[selectedDate][category].splice(index, 1);
          saveToFirestore();
          renderTasks();
          displayCalendar();
        });
        ul.appendChild(li);
      });
    }
  });
};

prev.addEventListener("click", () => {
  year--;
  displayCalendar();
});

next.addEventListener("click", () => {
  year++;
  displayCalendar();
});

tabs.forEach(tab => {
  tab.addEventListener('click', function (e) {
    tabs.forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    month = monthsName.indexOf(e.target.textContent);
    displayCalendar();
  });
});

days.addEventListener("click", findDay);
submitBtn.addEventListener("click", listResult);

window.addEventListener('load', function () {
  document.getElementById('spinner').style.display = 'none';
  displayCalendar();
});

const toggleBtn = document.getElementById('dark-mode-toggle');
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
});

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("task-search");
  const modal = document.getElementById("modal");
  const hideModal = document.getElementById("hide-modal");

  let categories = ["work", "personal", "ministry"];

  searchInput.addEventListener("input", () => {
    let input = searchInput.value;
    if (input === "") {
      modal.classList.add("hidden");
    } else {
      for (const date in toDoListObj) {
        for (const category of categories) {
          if (toDoListObj[date][category].includes(input)) {
            let taskDate = date.split("-");
            modal.innerHTML = `<p>Your task '${input}' is on ${taskDate[2]} ${monthsName[Number(taskDate[1]) - 1]} ${taskDate[0]}</p>`;
            modal.classList.remove("hidden");
            return;
          }
        }
      }
    }
  });

  hideModal.addEventListener("click", () => {
    modal.classList.add("hidden");
  });
});
