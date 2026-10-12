// Frontend-to-backend connection. Keep the FastAPI server running on port 8000.
const API = "http://127.0.0.1:8000";
const $ = (id) => document.getElementById(id);
let toastTimer;

function showToast(message, error = false) {
  $("toast").textContent = message;
  $("toast").className = "toast show" + (error ? " error" : "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("toast").className = "toast", 3500);
}
async function apiRequest(path, options = {}) {
  const response = await fetch(API + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) {
    let message = data && data.detail ? data.detail : `Request failed (${response.status})`;
    if (typeof message !== "string") message = JSON.stringify(message);
    throw new Error(message);
  }
  return data;
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function placement(value) {
  return `<span class="pill ${value ? "yes" : "no"}">${value ? "Placed" : "Not placed"}</span>`;
}
function renderStudents(data) {
  const rows = Object.entries(data || {}).sort((a,b) => Number(a[0]) - Number(b[0]));
  $("totalCount").textContent = rows.length;
  $("placedCount").textContent = rows.filter(([,s]) => s.Placed === true).length;
  $("notPlacedCount").textContent = rows.filter(([,s]) => s.Placed !== true).length;
  $("studentsBody").innerHTML = rows.length ? rows.map(([roll,s]) => `
    <tr><td><span class="roll">${escapeHtml(roll)}</span></td>
    <td><strong>${escapeHtml(s.Name)}</strong></td><td>${escapeHtml(s.Marks)}</td>
    <td>${escapeHtml(s.Address)}</td><td>${placement(s.Placed)}</td></tr>`).join("")
    : '<tr><td colspan="5" class="empty">No student records found.</td></tr>';
}
async function refreshStudents() {
  try {
    renderStudents(await apiRequest("/"));
    $("apiStatus").className = "api-status";
    $("apiStatus").innerHTML = '<span class="dot"></span> API connected';
  } catch (error) {
    $("apiStatus").className = "api-status offline";
    $("apiStatus").innerHTML = '<span class="dot"></span> API unavailable';
    $("studentsBody").innerHTML = `<tr><td colspan="5" class="empty">Could not load students: ${escapeHtml(error.message)}. Start the backend and check the setup instructions.</td></tr>`;
    ["totalCount","placedCount","notPlacedCount"].forEach(id => $(id).textContent = "—");
  }
}
function formStudent(form) {
  const f = new FormData(form);
  return {
    roll: Number(f.get("roll")),
    name: String(f.get("name")).trim(),
    marks: Number(f.get("marks")),
    adress: String(f.get("adress")).trim(),
    placed: f.get("placed") === "true"
  };
}
$("addForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  try {
    await apiRequest("/add_student", { method: "POST", body: JSON.stringify(formStudent(form)) });
    form.reset();
    showToast("Student added successfully.");
    await refreshStudents();
  } catch (error) { showToast("Add failed: " + error.message, true); }
});
$("getForm").addEventListener("submit", async event => {
  event.preventDefault();
  const roll = new FormData(event.currentTarget).get("roll");
  try {
    const s = await apiRequest(`/get_student_record/${encodeURIComponent(roll)}`);
    $("getResult").innerHTML = `<strong>${escapeHtml(s.Name)}</strong><br>Roll number: ${escapeHtml(roll)}<br>Marks: ${escapeHtml(s.Marks)}<br>Address: ${escapeHtml(s.Address)}<br>Placement: ${placement(s.Placed)}`;
  } catch (error) {
    $("getResult").textContent = "Could not find student: " + error.message;
    showToast("Get failed: " + error.message, true);
  }
});
$("updateForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const f = new FormData(form);
  const roll = f.get("urlRoll");
  const student = {
    name: String(f.get("name")).trim(),
    marks: Number(f.get("marks")),
    adress: String(f.get("adress")).trim(),
    placed: f.get("placed") === "true"
  };
  try {
    await apiRequest(`/update_student/${encodeURIComponent(roll)}`, { method: "PUT", body: JSON.stringify(student) });
    form.reset();
    showToast("Student updated successfully.");
    await refreshStudents();
  } catch (error) { showToast("Update failed: " + error.message, true); }
});
$("deleteForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const roll = new FormData(form).get("roll");
  if (!confirm(`Delete student with roll number ${roll}?`)) return;
  try {
    await apiRequest(`/delete_student/${encodeURIComponent(roll)}`, { method: "DELETE" });
    form.reset();
    showToast("Student deleted successfully.");
    await refreshStudents();
  } catch (error) { showToast("Delete failed: " + error.message, true); }
});
$("refreshBtn").addEventListener("click", refreshStudents);
refreshStudents();
