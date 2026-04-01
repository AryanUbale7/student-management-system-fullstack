const API_URL = "http://localhost:3000/students";

const studentForm = document.getElementById('student-form');
const tableBody = document.getElementById('student-table-body');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formTitle = document.getElementById('form-title');
const statusMsg = document.getElementById('status-msg');

let isEditing = false;
let editId = null;

// 🔹 LOAD STUDENTS
async function loadStudents() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        allStudents = data;   // 🔥 store data
        renderTable(data);
        updateStats(data);

    } catch (err) {
        console.error("Error loading students");
    }
}

// 🔹 RENDER TABLE
function renderTable(students) {
    tableBody.innerHTML = "";

    students.forEach(s => {
        tableBody.innerHTML += `
        <tr>
            <td>#${s.id}</td>
            <td>${s.name}</td>
            <td>${s.email}</td>
            <td>${s.phone || '-'}</td>
            <td>${s.course}</td>
            <td>${s.gender || '-'}</td>
            <td>
                <button class="action-btn edit-btn" onclick='editStudent(${JSON.stringify(s)})'>Edit</button>
                <button class="action-btn delete-btn" onclick="deleteStudent(${s.id})">Delete</button>
            </td>
        </tr>
        `;
    });
}

// 🔹 ADD / UPDATE STUDENT
studentForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Prevent double click
    submitBtn.disabled = true;

    const genderInput = document.querySelector('input[name="gender"]:checked');

    const student = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        course: document.getElementById("course").value,
        dob: document.getElementById("dob").value,
        enrollment_date: document.getElementById("enrollment_date").value,
        gender: genderInput ? genderInput.value : "",
        address: document.getElementById("address").value
    };

    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_URL}/${editId}` : API_URL;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(student)
        });

        if (res.ok) {
            showToast(isEditing ? "Student Updated ✅" : "Student Added ✅");
            resetForm();
            loadStudents();
        } else {
            alert("Operation failed!");
        }

    } catch (err) {
        alert("Server error!");
    }

    submitBtn.disabled = false;
});

// 🔹 DELETE
async function deleteStudent(id) {
    if (confirm("Are you sure to delete?")) {
        await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });
        showToast("Student Deleted ❌");
        loadStudents();
    }
}

// 🔹 EDIT
function editStudent(s) {
    isEditing = true;
    editId = s.id;

    document.getElementById("name").value = s.name;
    document.getElementById("email").value = s.email;
    document.getElementById("phone").value = s.phone || "";
    document.getElementById("course").value = s.course;
    document.getElementById("dob").value = s.dob || "";
    document.getElementById("enrollment_date").value = s.enrollment_date || "";
    document.getElementById("address").value = s.address || "";

    // gender set
    if (s.gender) {
        const radio = document.querySelector(`input[name="gender"][value="${s.gender}"]`);
        if (radio) radio.checked = true;
    }

    formTitle.innerText = "Update Student";
    submitBtn.innerText = "Update";
    cancelBtn.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// 🔹 RESET FORM
function resetForm() {
    isEditing = false;
    editId = null;
    studentForm.reset();

    formTitle.innerText = "Add Student";
    submitBtn.innerText = "Add Student";
    cancelBtn.classList.add("hidden");
}

// 🔹 TOAST MESSAGE
function showToast(msg) {
    statusMsg.innerText = msg;
    statusMsg.classList.add("status-show");

    setTimeout(() => {
        statusMsg.classList.remove("status-show");
    }, 3000);
}

// 🔹 CANCEL BUTTON
if (cancelBtn) {
    cancelBtn.onclick = resetForm;
}

// 🔹 INITIAL LOAD
document.addEventListener("DOMContentLoaded", loadStudents);
let allStudents = [];
function searchStudents(query) {
    const filtered = allStudents.filter(s => 
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.email.toLowerCase().includes(query.toLowerCase())
    );

    renderTable(filtered);
}
const searchInput = document.getElementById("search-input");

if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        searchStudents(e.target.value);
    });
}
function filterByCourse(course) {
    const filtered = allStudents.filter(s => s.course === course);
    renderTable(filtered);
}
function updateStats(students) {
    const total = students.length;

    const male = students.filter(s => s.gender === "Male").length;
    const female = students.filter(s => s.gender === "Female").length;
    const other = students.filter(s => s.gender === "Other").length;

    document.getElementById("total-count").innerText = total;
    document.getElementById("male-count").innerText = male;
    document.getElementById("female-count").innerText = female;
    document.getElementById("other-count").innerText = other;
}
function exportToCSV() {

    if (allStudents.length === 0) {
        alert("No data to export!");
        return;
    }

    // CSV headers
    let csv = "ID,Name,Email,Phone,Course,Gender,DOB,Enrollment Date,Address\n";

    // Data rows
    allStudents.forEach(s => {
        csv += `${s.id},"${s.name}","${s.email}","${s.phone || ''}","${s.course}","${s.gender || ''}","${s.dob || ''}","${s.enrollment_date || ''}","${s.address || ''}"\n`;
    });

    // Create file
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    // Download
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_data.csv";
    a.click();

    window.URL.revokeObjectURL(url);
}
const exportBtn = document.getElementById("export-btn");

if (exportBtn) {
    exportBtn.addEventListener("click", exportToCSV);
}
