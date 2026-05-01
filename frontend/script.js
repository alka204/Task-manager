const token = localStorage.getItem("token");
const API_BASE = localStorage.getItem("apiBaseUrl") || "http://localhost:5000/api";

if (!token) {
  window.location.href = "login.html";
}

const state = {
  user: null,
  members: [],
  projects: [],
  tasks: [],
};

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  hydrateUserFromToken();
  applyRoleVisibility();
  refreshAll();
});

function initNavigation() {
  const navButtons = document.querySelectorAll(".nav-link[data-section]");
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      navButtons.forEach((item) => item.classList.remove("active"));
      btn.classList.add("active");

      const targetId = btn.getAttribute("data-section");
      document.querySelectorAll("main section").forEach((section) => {
        section.classList.toggle("d-none", section.id !== targetId);
      });
    });
  });
}

function hydrateUserFromToken() {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    state.user = {
      id: payload.userId,
      role: payload.role,
    };
    document.getElementById("userMeta").textContent = `Role: ${state.user.role}`;
  } catch (_error) {
    logout();
  }
}

function applyRoleVisibility() {
  const isAdmin = state.user && state.user.role === "admin";
  document.getElementById("projectFormCard").classList.toggle("d-none", !isAdmin);
  document.getElementById("taskFormCard").classList.toggle("d-none", !isAdmin);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    logout();
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (data && data.message) || "Request failed";
    throw new Error(message);
  }

  return data;
}

async function refreshAll() {
  try {
    await Promise.all([loadDashboard(), loadTeamMembers(), loadProjects(), loadTasks()]);
  } catch (error) {
    alert(error.message);
  }
}

async function loadDashboard() {
  const stats = await request("/dashboard/stats");
  if (!stats) {
    return;
  }

  const cards = [
    ["Total Tasks", stats.totalTasks, "primary"],
    ["Pending", stats.pendingTasks, "warning"],
    ["In Progress", stats.inProgressTasks, "info"],
    ["Completed", stats.completedTasks, "success"],
    ["Overdue", stats.overdueTasks, "danger"],
  ];

  const statsGrid = document.getElementById("statsGrid");
  statsGrid.innerHTML = cards
    .map(
      ([label, value, color]) => `
        <div class="col-md-4 col-lg-3">
          <div class="card stat-card shadow-sm border-start border-4 border-${color}">
            <div class="card-body">
              <div class="text-muted small">${label}</div>
              <div class="fs-3 fw-semibold ${color === "danger" ? "overdue-text" : ""}">${value}</div>
            </div>
          </div>
        </div>
      `,
    )
    .join("");
}

async function loadTeamMembers() {
  const teamList = document.getElementById("teamList");

  if (!state.user || state.user.role !== "admin") {
    teamList.innerHTML =
      '<p class="text-muted mb-0">Team list is visible to admins. Members can still see project members below.</p>';
    state.members = [];
    return;
  }

  const members = await request("/users/members");
  if (!members) {
    return;
  }

  state.members = members;
  teamList.innerHTML = `
    <table class="table table-striped align-middle">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        ${members
          .map(
            (member) => `
          <tr>
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td><span class="badge ${member.role === "admin" ? "bg-dark" : "bg-secondary"}">${member.role}</span></td>
          </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;

  fillMemberSelect();
}

async function loadProjects() {
  const projects = await request("/projects");
  if (!projects) {
    return;
  }

  state.projects = projects;
  renderProjects();
  fillProjectSelect();
}

function renderProjects() {
  const projectList = document.getElementById("projectList");
  const isAdmin = state.user && state.user.role === "admin";

  if (!state.projects.length) {
    projectList.innerHTML = '<p class="text-muted">No projects found.</p>';
    return;
  }

  projectList.innerHTML = state.projects
    .map((project) => {
      const memberNames = (project.members || []).map((m) => m.name).join(", ") || "No members";
      return `
      <div class="col-lg-6">
        <div class="card content-card shadow-sm h-100">
          <div class="card-body">
            <h5 class="mb-1">${project.name}</h5>
            <p class="text-muted mb-2">${project.description}</p>
            <p class="mb-1"><strong>Created by:</strong> ${project.createdBy ? project.createdBy.name : "Unknown"}</p>
            <p class="mb-2"><strong>Members:</strong> ${memberNames}</p>
            ${
              isAdmin
                ? `
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-sm btn-outline-primary" onclick="promptAddMember('${project._id}')">Add Member</button>
                <button class="btn btn-sm btn-outline-warning" onclick="promptRemoveMember('${project._id}')">Remove Member</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProject('${project._id}')">Delete</button>
              </div>
            `
                : ""
            }
          </div>
        </div>
      </div>`;
    })
    .join("");
}

function fillMemberSelect() {
  const select = document.getElementById("projectMembers");
  if (!select) {
    return;
  }

  select.innerHTML = state.members
    .map((member) => `<option value="${member._id}">${member.name} (${member.role})</option>`)
    .join("");

  const assigneeSelect = document.getElementById("taskAssignedTo");
  assigneeSelect.innerHTML = '<option value="">Assign to...</option>' +
    state.members.map((member) => `<option value="${member._id}">${member.name}</option>`).join("");
}

function fillProjectSelect() {
  const select = document.getElementById("taskProject");
  select.innerHTML =
    '<option value="">Choose project...</option>' +
    state.projects.map((project) => `<option value="${project._id}">${project.name}</option>`).join("");
}

async function createProject() {
  const name = document.getElementById("projectName").value.trim();
  const description = document.getElementById("projectDescription").value.trim();
  const members = Array.from(document.getElementById("projectMembers").selectedOptions).map(
    (option) => option.value,
  );

  if (!name || !description) {
    alert("Project name and description are required.");
    return;
  }

  try {
    await request("/projects", {
      method: "POST",
      body: JSON.stringify({ name, description, members }),
    });
    document.getElementById("projectName").value = "";
    document.getElementById("projectDescription").value = "";
    document.getElementById("projectMembers").selectedIndex = -1;
    await loadProjects();
  } catch (error) {
    alert(error.message);
  }
}

async function promptAddMember(projectId) {
  const memberId = prompt("Enter member user ID to add:");
  if (!memberId) {
    return;
  }

  try {
    await request(`/projects/${projectId}/members/add`, {
      method: "PATCH",
      body: JSON.stringify({ memberId }),
    });
    await loadProjects();
  } catch (error) {
    alert(error.message);
  }
}

async function promptRemoveMember(projectId) {
  const memberId = prompt("Enter member user ID to remove:");
  if (!memberId) {
    return;
  }

  try {
    await request(`/projects/${projectId}/members/remove`, {
      method: "PATCH",
      body: JSON.stringify({ memberId }),
    });
    await loadProjects();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteProject(projectId) {
  if (!confirm("Delete this project and all related tasks?")) {
    return;
  }

  try {
    await request(`/projects/${projectId}`, { method: "DELETE" });
    await Promise.all([loadProjects(), loadTasks(), loadDashboard()]);
  } catch (error) {
    alert(error.message);
  }
}

async function createTask() {
  const title = document.getElementById("taskTitle").value.trim();
  const description = document.getElementById("taskDescription").value.trim();
  const priority = document.getElementById("taskPriority").value;
  const deadline = document.getElementById("taskDeadline").value;
  const project = document.getElementById("taskProject").value;
  const assignedTo = document.getElementById("taskAssignedTo").value;

  if (!title || !description || !deadline || !project || !assignedTo) {
    alert("All task fields are required.");
    return;
  }

  try {
    await request("/tasks", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        priority,
        deadline,
        project,
        assignedTo,
      }),
    });
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("taskDeadline").value = "";
    document.getElementById("taskProject").value = "";
    document.getElementById("taskAssignedTo").value = "";
    await Promise.all([loadTasks(), loadDashboard()]);
  } catch (error) {
    alert(error.message);
  }
}

async function loadTasks() {
  const tasks = await request("/tasks");
  if (!tasks) {
    return;
  }

  state.tasks = tasks;
  const taskList = document.getElementById("taskList");

  if (!tasks.length) {
    taskList.innerHTML = '<p class="text-muted">No tasks found.</p>';
    return;
  }

  taskList.innerHTML = tasks
    .map((task) => {
      const canDelete = state.user && state.user.role === "admin";
      return `
      <div class="col-lg-6">
        <div class="card content-card shadow-sm h-100">
          <div class="card-body">
            <h5>${task.title}</h5>
            <p class="text-muted mb-2">${task.description}</p>
            <p class="mb-1"><strong>Project:</strong> ${task.project ? task.project.name : "N/A"}</p>
            <p class="mb-1"><strong>Assigned:</strong> ${task.assignedTo ? task.assignedTo.name : "N/A"}</p>
            <p class="mb-1"><strong>Priority:</strong> ${task.priority}</p>
            <p class="mb-2"><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</p>

            <div class="d-flex flex-wrap gap-2 align-items-center">
              <select class="form-select form-select-sm w-auto" onchange="updateTaskStatus('${task._id}', this.value)">
                <option value="Pending" ${task.status === "Pending" ? "selected" : ""}>Pending</option>
                <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
                <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>
              </select>
              ${
                canDelete
                  ? `<button class="btn btn-sm btn-outline-danger" onclick="deleteTask('${task._id}')">Delete</button>`
                  : ""
              }
            </div>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

async function updateTaskStatus(taskId, status) {
  try {
    await request(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    await loadDashboard();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteTask(taskId) {
  if (!confirm("Delete this task?")) {
    return;
  }

  try {
    await request(`/tasks/${taskId}`, { method: "DELETE" });
    await Promise.all([loadTasks(), loadDashboard()]);
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}
