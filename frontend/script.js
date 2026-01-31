const API_URL = "http://localhost:5000/api/tasks";
const token = localStorage.getItem("token");

if (!token) window.location.href = "login.html";

window.onload = fetchTasks;

async function fetchTasks() {
  const res = await fetch(API_URL, {
    headers: { Authorization: "Bearer " + token },
  });

  const tasks = await res.json();
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task) => {
    const col = document.createElement("div");
    col.className = "col-md-4";

    const card = document.createElement("div");
    card.className = "card shadow-sm";

    card.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description || ""}</p>
        <span class="badge ${
          task.status === "Completed" ? "bg-success" : "bg-warning text-dark"
        }">${task.status}</span>
        <div class="mt-3 d-flex justify-content-between">
          <button class="btn btn-sm btn-success" onclick="markCompleted('${task._id}')">✅ Complete</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTask('${task._id}')">❌ Delete</button>
        </div>
      </div>
    `;

    col.appendChild(card);
    list.appendChild(col);
  });
}

async function addTask() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  if (!title) return alert("Title is required");

  await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ title, description }),
  });

  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });
  fetchTasks();
}

async function markCompleted(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ status: "Completed" }),
  });
  fetchTasks();
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
