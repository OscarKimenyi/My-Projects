// Check authentication first
const currentUser = AuthManager ? AuthManager.checkAuth() : null;

if (!currentUser) {
  // Not authenticated, should redirect to login
  console.log("User not authenticated");
}

const API_BASE = "http://localhost:5000/api";

// Check authentication on page load
function checkAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    // Redirect to login if not authenticated
    window.location.href = "login.html";
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    // If user data is corrupted, redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
    return null;
  }
}

// Enhanced API call with authentication
// async function apiCall(endpoint, method = "GET", data = null) {
//   const token = localStorage.getItem("token");

//   const options = {
//     method,
//     headers: {
//       "Content-Type": "application/json",
//     },
//   };

//   if (token) {
//     options.headers["Authorization"] = `Bearer ${token}`;
//   }

//   if (data && (method === "POST" || method === "PUT")) {
//     options.body = JSON.stringify(data);
//   }

//   try {
//     const response = await fetch(`${API_BASE}${endpoint}`, options);

//     if (response.status === 401) {
//       // Token expired or invalid
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       window.location.href = "login.html";
//       throw new Error("Authentication required");
//     }

//     const result = await response.json();

//     if (!response.ok) {
//       throw new Error(
//         result.message || `HTTP error! status: ${response.status}`
//       );
//     }

//     if (!result.success) {
//       throw new Error(result.message || "API call failed");
//     }

//     return result;
//   } catch (error) {
//     console.error(`API Call failed: ${endpoint}`, error);
//     throw error;
//   }
// }

// Enhanced API call with authentication
async function apiCall(endpoint, method = "GET", data = null) {
  const token = AuthManager.getToken();

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (token) {
    options.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (response.status === 401) {
      // Token expired or invalid
      AuthManager.logout();
      throw new Error("Authentication required");
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP error! status: ${response.status}`
      );
    }

    if (!result.success) {
      throw new Error(result.message || "API call failed");
    }

    return result;
  } catch (error) {
    console.error(`API Call failed: ${endpoint}`, error);
    throw error;
  }
}

// Add logout functionality
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

class HospitalManagementSystem {
  constructor() {
    this.currentPatientId = null;
    this.currentAppointmentId = null;
    this.currentDrugId = null;
    this.currentLabTestId = null;
    this.init();
  }

  init() {
    console.log("🚀 Initializing Hospital Management System...");
    this.bindEvents();
    this.loadDashboard();
    this.showPage("dashboard");
  }

  bindEvents() {
    console.log("🔗 Binding events...");

    // Navigation
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const page = e.target.getAttribute("data-page");
        console.log("📄 Switching to page:", page);
        this.showPage(page);
      });
    });

    // Patient Management
    document.getElementById("add-patient-btn").addEventListener("click", () => {
      console.log("➕ Add patient clicked");
      this.showPatientModal();
    });

    document.getElementById("patient-form").addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("💾 Saving patient...");
      this.savePatient();
    });

    document.getElementById("cancel-patient").addEventListener("click", () => {
      this.hidePatientModal();
    });

    document
      .getElementById("search-patient-btn")
      .addEventListener("click", () => {
        this.searchPatients();
      });

    document
      .getElementById("patient-search")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.searchPatients();
        }
      });

    // Appointment Management
    document
      .getElementById("add-appointment-btn")
      .addEventListener("click", () => {
        console.log("➕ Add appointment clicked");
        this.showAppointmentModal();
      });

    document
      .getElementById("appointment-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("💾 Saving appointment...");
        this.saveAppointment();
      });

    document
      .getElementById("cancel-appointment")
      .addEventListener("click", () => {
        this.hideAppointmentModal();
      });

    // === PHARMACY EVENTS ===
    document.getElementById("add-drug-btn").addEventListener("click", () => {
      this.showDrugModal();
    });

    document.getElementById("drug-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveDrug();
    });

    document.getElementById("cancel-drug").addEventListener("click", () => {
      this.hideDrugModal();
    });

    document.getElementById("search-drug-btn").addEventListener("click", () => {
      this.searchDrugs();
    });

    document.getElementById("drug-search").addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.searchDrugs();
      }
    });

    document
      .getElementById("view-low-stock-btn")
      .addEventListener("click", () => {
        this.loadLowStockDrugs();
      });

    // === LABORATORY EVENTS ===
    document
      .getElementById("add-lab-test-btn")
      .addEventListener("click", () => {
        this.showLabTestModal();
      });

    document.getElementById("lab-test-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveLabTest();
    });

    document.getElementById("cancel-lab-test").addEventListener("click", () => {
      this.hideLabTestModal();
    });

    document
      .getElementById("search-lab-test-btn")
      .addEventListener("click", () => {
        this.searchLabTests();
      });

    document
      .getElementById("lab-test-search")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.searchLabTests();
        }
      });

    // Modal close events
    document.querySelectorAll(".close").forEach((closeBtn) => {
      closeBtn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal");
        modal.style.display = "none";
      });
    });

    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.style.display = "none";
      }
    });

    console.log("✅ All events bound successfully");
  }

  showPage(pageName) {
    console.log("🔄 Showing page:", pageName);

    // Update navigation
    document.querySelectorAll(".nav-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-page="${pageName}"]`).classList.add("active");

    // Show page
    document.querySelectorAll(".page").forEach((page) => {
      page.classList.remove("active");
    });
    document.getElementById(`${pageName}-page`).classList.add("active");

    // Load page data
    switch (pageName) {
      case "dashboard":
        this.loadDashboard();
        break;
      case "patients":
        this.loadPatients();
        break;
      case "appointments":
        this.loadAppointments();
        break;
      case "pharmacy":
        this.loadDrugs();
        break;
      case "laboratory":
        this.loadLabTests();
        break;
      case "billing":
        // Will implement later
        break;
    }
  }

  async loadDashboard() {
    console.log("📊 Loading dashboard...");
    try {
      const [patientsRes, appointmentsRes, drugsRes, labTestsRes] =
        await Promise.all([
          this.apiCall("/patients"),
          this.apiCall("/appointments"),
          this.apiCall("/drugs"),
          this.apiCall("/lab-tests"),
        ]);

      const patients = patientsRes.data || [];
      const appointments = appointmentsRes.data || [];
      const drugs = drugsRes.data || [];
      const labTests = labTestsRes.data || [];

      // Get today's appointments
      const todayAppointments = appointments.filter((apt) => {
        return this.isDateToday(apt.appointment_date);
      });

      // Get low stock drugs
      const lowStockDrugs = drugs.filter(
        (drug) => drug.stock_quantity <= drug.reorder_level
      );

      console.log("📈 Dashboard stats:", {
        patients: patients.length,
        appointments: appointments.length,
        todayAppointments: todayAppointments.length,
        drugs: drugs.length,
        lowStockDrugs: lowStockDrugs.length,
        labTests: labTests.length,
      });

      // Update dashboard cards
      document.getElementById("total-patients").textContent = patients.length;
      document.getElementById("total-appointments").textContent =
        appointments.length;
      document.getElementById("today-appointments").textContent =
        todayAppointments.length;

      this.displayRecentActivities(appointments.slice(0, 5));
      document.getElementById("total-drugs").textContent = drugs.length;
      document.getElementById("low-stock-drugs").textContent =
        lowStockDrugs.length;
      document.getElementById("total-lab-tests").textContent = labTests.length;
    } catch (error) {
      console.error("❌ Failed to load dashboard:", error);
      this.showError("Failed to load dashboard data");
    }
  }
  displayRecentActivities(appointments) {
    const container = document.getElementById("recent-activities");
    if (!container) {
      console.error("❌ Recent activities container not found");
      return;
    }

    if (appointments.length === 0) {
      container.innerHTML = "<p>No recent activities</p>";
      return;
    }

    container.innerHTML = appointments
      .map((apt) => {
        const isToday = this.isDateToday(apt.appointment_date);
        const dateDisplay = isToday
          ? "Today"
          : this.formatDateForDisplay(apt.appointment_date);
        const timeDisplay = this.formatTimeForDisplay(apt.appointment_time);

        return `
            <div class="activity-item">
                <strong>${apt.first_name} ${apt.last_name}</strong> - 
                Appointment with ${apt.doctor_name} on ${dateDisplay}
                at ${timeDisplay}
                <span class="status-badge status-${apt.status.toLowerCase()}">${
          apt.status
        }</span>
                ${
                  isToday
                    ? '<span style="color: green; margin-left: 5px;">📍 Today</span>'
                    : ""
                }
            </div>
        `;
      })
      .join("");
  }

  async loadPatients() {
    console.log("👥 Loading patients...");
    try {
      const response = await this.apiCall("/patients");
      this.displayPatients(response.data || []);
    } catch (error) {
      console.error("❌ Failed to load patients:", error);
      this.showError("Failed to load patients");
    }
  }

  displayPatients(patients) {
    const tbody = document.getElementById("patients-table-body");
    if (!tbody) {
      console.error("❌ Patients table body not found");
      return;
    }

    if (patients.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align: center;">No patients found</td></tr>';
      return;
    }

    tbody.innerHTML = patients
      .map(
        (patient) => `
            <tr>
                <td>${patient.patient_id}</td>
                <td>${patient.first_name} ${patient.last_name}</td>
                <td>${patient.email || "N/A"}</td>
                <td>${patient.phone || "N/A"}</td>
                <td>${patient.gender || "N/A"}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="app.editPatient(${
                      patient.id
                    })">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="app.deletePatient(${
                      patient.id
                    })">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `
      )
      .join("");
  }

  async searchPatients() {
    const query = document.getElementById("patient-search").value.trim();
    if (!query) {
      this.loadPatients();
      return;
    }

    try {
      const response = await this.apiCall(
        `/patients/search?q=${encodeURIComponent(query)}`
      );
      this.displayPatients(response.data || []);
    } catch (error) {
      this.showError("Failed to search patients");
    }
  }

  async loadAppointments() {
    console.log("📅 Loading appointments...");
    try {
      const response = await this.apiCall("/appointments");
      this.displayAppointments(response.data || []);
    } catch (error) {
      console.error("❌ Failed to load appointments:", error);
      this.showError("Failed to load appointments");
    }
  }

  displayAppointments(appointments) {
    const tbody = document.getElementById("appointments-table-body");
    if (!tbody) {
      console.error("❌ Appointments table body not found");
      return;
    }

    if (appointments.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="7" style="text-align: center;">No appointments found</td></tr>';
      return;
    }

    tbody.innerHTML = appointments
      .map((apt) => {
        // Use consistent date formatting
        const displayDate = this.formatDateForDisplay(apt.appointment_date);
        const displayTime = this.formatTimeForDisplay(apt.appointment_time);

        return `
            <tr>
                <td>${apt.appointment_id}</td>
                <td>${apt.first_name} ${apt.last_name} (${apt.patient_id})</td>
                <td>${apt.doctor_name}</td>
                <td>${displayDate} ${displayTime}</td>
                <td>${apt.appointment_type}</td>
                <td><span class="status-badge status-${apt.status.toLowerCase()}">${
          apt.status
        }</span></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="app.editAppointment(${
                      apt.id
                    })">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteAppointment(${
                      apt.id
                    })">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
      })
      .join("");
  }

  showPatientModal(patient = null) {
    this.currentPatientId = patient ? patient.id : null;
    const modal = document.getElementById("patient-modal");
    const title = document.getElementById("patient-modal-title");
    const form = document.getElementById("patient-form");

    if (patient) {
      title.textContent = "Edit Patient";
      Object.keys(patient).forEach((key) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = patient[key] || "";
      });
    } else {
      title.textContent = "Add New Patient";
      form.reset();
    }

    modal.style.display = "block";
  }

  hidePatientModal() {
    document.getElementById("patient-modal").style.display = "none";
    this.currentPatientId = null;
  }

  async savePatient() {
    const form = document.getElementById("patient-form");
    const formData = new FormData(form);

    // Convert FormData to object and trim values
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = typeof value === "string" ? value.trim() : value;
    }

    console.log("Processed patient data:", data);

    // Basic validation
    if (!data.first_name) {
      this.showError("First name is required");
      document.getElementById("first_name").focus();
      return;
    }

    if (!data.last_name) {
      this.showError("Last name is required");
      document.getElementById("last_name").focus();
      return;
    }

    if (!data.phone) {
      this.showError("Phone number is required");
      document.getElementById("phone").focus();
      return;
    }

    try {
      if (this.currentPatientId) {
        await this.apiCall(`/patients/${this.currentPatientId}`, "PUT", data);
        this.showSuccess("Patient updated successfully");
      } else {
        await this.apiCall("/patients", "POST", data);
        this.showSuccess("Patient created successfully");
      }

      this.hidePatientModal();
      this.loadPatients();
      this.loadDashboard();
    } catch (error) {
      console.error("Error saving patient:", error);
      this.showError("Failed to save patient: " + error.message);
    }
  }

  async editPatient(id) {
    try {
      const response = await this.apiCall(`/patients/${id}`);
      this.showPatientModal(response.data);
    } catch (error) {
      this.showError("Failed to load patient data");
    }
  }

  async deletePatient(id) {
    if (!confirm("Are you sure you want to delete this patient?")) return;

    try {
      await this.apiCall(`/patients/${id}`, "DELETE");
      this.showSuccess("Patient deleted successfully");
      this.loadPatients();
      this.loadDashboard();
    } catch (error) {
      this.showError("Failed to delete patient");
    }
  }

  async showAppointmentModal(appointment = null) {
    await this.loadPatientOptions();

    this.currentAppointmentId = appointment ? appointment.id : null;
    const modal = document.getElementById("appointment-modal");
    const title = document.getElementById("appointment-modal-title");
    const form = document.getElementById("appointment-form");

    if (appointment) {
      title.textContent = "Edit Appointment";
      // Convert date to YYYY-MM-DD format for input[type=date]
      const appointmentDate = this.formatDateForAPI(
        appointment.appointment_date
      );

      Object.keys(appointment).forEach((key) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
          if (key === "appointment_date" && appointmentDate) {
            input.value = appointmentDate;
          } else {
            input.value = appointment[key] || "";
          }
        }
      });
    } else {
      title.textContent = "Schedule Appointment";
      form.reset();
      // Set today's date in correct format for date input
      document.getElementById("appointment_date").value = new Date()
        .toISOString()
        .split("T")[0];
      document.getElementById("appointment_time").value = "09:00";
    }

    modal.style.display = "block";
  }

  hideAppointmentModal() {
    document.getElementById("appointment-modal").style.display = "none";
    this.currentAppointmentId = null;
  }

  async loadPatientOptions() {
    try {
      const response = await this.apiCall("/patients");
      const select = document.getElementById("patient_id");
      select.innerHTML =
        '<option value="">Select Patient</option>' +
        (response.data || [])
          .map(
            (patient) =>
              `<option value="${patient.id}">${patient.first_name} ${patient.last_name} (${patient.patient_id})</option>`
          )
          .join("");
    } catch (error) {
      console.error("Failed to load patients for dropdown:", error);
    }
  }

  async saveAppointment() {
    const form = document.getElementById("appointment-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      if (this.currentAppointmentId) {
        await this.apiCall(
          `/appointments/${this.currentAppointmentId}`,
          "PUT",
          data
        );
        this.showSuccess("Appointment updated successfully");
      } else {
        await this.apiCall("/appointments", "POST", data);
        this.showSuccess("Appointment created successfully");
      }

      this.hideAppointmentModal();
      this.loadAppointments();
      this.loadDashboard();
    } catch (error) {
      this.showError("Failed to save appointment: " + error.message);
    }
  }

  async editAppointment(id) {
    try {
      const response = await this.apiCall(`/appointments/${id}`);
      this.showAppointmentModal(response.data);
    } catch (error) {
      this.showError("Failed to load appointment data");
    }
  }

  async deleteAppointment(id) {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      await this.apiCall(`/appointments/${id}`, "DELETE");
      this.showSuccess("Appointment deleted successfully");
      this.loadAppointments();
      this.loadDashboard();
    } catch (error) {
      this.showError("Failed to delete appointment");
    }
  }

  // ==================== PHARMACY METHODS ====================

  async loadDrugs() {
    console.log("💊 Loading drugs...");
    try {
      const response = await this.apiCall("/drugs");
      this.displayDrugs(response.data || []);
    } catch (error) {
      console.error("❌ Failed to load drugs:", error);
      this.showError("Failed to load drugs");
    }
  }

  displayDrugs(drugs) {
    const tbody = document.getElementById("drugs-table-body");
    if (!tbody) {
      console.error("❌ Drugs table body not found");
      return;
    }

    if (drugs.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="8" style="text-align: center;">No drugs found</td></tr>';
      return;
    }

    tbody.innerHTML = drugs
      .map((drug) => {
        const isLowStock = drug.stock_quantity <= drug.reorder_level;
        const statusClass = isLowStock
          ? "status-cancelled"
          : "status-completed";
        const statusText = isLowStock ? "Low Stock" : "In Stock";

        return `
            <tr>
                <td>${drug.drug_id}</td>
                <td>${drug.name}</td>
                <td>${drug.brand || "N/A"}</td>
                <td>${drug.category || "N/A"}</td>
                <td>$${drug.unit_price}</td>
                <td>${drug.stock_quantity}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="app.editDrug(${
                      drug.id
                    })">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteDrug(${
                      drug.id
                    })">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
      })
      .join("");
  }

  async searchDrugs() {
    const query = document.getElementById("drug-search").value.trim();
    if (!query) {
      this.loadDrugs();
      return;
    }

    try {
      const response = await this.apiCall(
        `/drugs/search?q=${encodeURIComponent(query)}`
      );
      this.displayDrugs(response.data || []);
    } catch (error) {
      this.showError("Failed to search drugs");
    }
  }

  async loadLowStockDrugs() {
    try {
      const response = await this.apiCall("/drugs/low-stock");
      this.displayDrugs(response.data || []);
      this.showSuccess(`Found ${response.data.length} drugs with low stock`);
    } catch (error) {
      this.showError("Failed to load low stock drugs");
    }
  }

  showDrugModal(drug = null) {
    this.currentDrugId = drug ? drug.id : null;
    const modal = document.getElementById("drug-modal");
    const title = document.getElementById("drug-modal-title");
    const form = document.getElementById("drug-form");

    if (drug) {
      title.textContent = "Edit Drug";
      Object.keys(drug).forEach((key) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = drug[key] || "";
      });
    } else {
      title.textContent = "Add New Drug";
      form.reset();
    }

    modal.style.display = "block";
  }

  hideDrugModal() {
    document.getElementById("drug-modal").style.display = "none";
    this.currentDrugId = null;
  }

  async saveDrug() {
    const form = document.getElementById("drug-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Convert number fields
    data.unit_price = parseFloat(data.unit_price);
    data.stock_quantity = parseInt(data.stock_quantity);
    data.reorder_level = parseInt(data.reorder_level);

    try {
      if (this.currentDrugId) {
        await this.apiCall(`/drugs/${this.currentDrugId}`, "PUT", data);
        this.showSuccess("Drug updated successfully");
      } else {
        await this.apiCall("/drugs", "POST", data);
        this.showSuccess("Drug created successfully");
      }

      this.hideDrugModal();
      this.loadDrugs();
    } catch (error) {
      this.showError("Failed to save drug: " + error.message);
    }
  }

  async editDrug(id) {
    try {
      const response = await this.apiCall(`/drugs/${id}`);
      this.showDrugModal(response.data);
    } catch (error) {
      this.showError("Failed to load drug data");
    }
  }

  async deleteDrug(id) {
    if (!confirm("Are you sure you want to delete this drug?")) return;

    try {
      await this.apiCall(`/drugs/${id}`, "DELETE");
      this.showSuccess("Drug deleted successfully");
      this.loadDrugs();
    } catch (error) {
      this.showError("Failed to delete drug");
    }
  }

  // ==================== LABORATORY METHODS ====================

  async loadLabTests() {
    console.log("🔬 Loading lab tests...");
    try {
      const response = await this.apiCall("/lab-tests");
      this.displayLabTests(response.data || []);
    } catch (error) {
      console.error("❌ Failed to load lab tests:", error);
      this.showError("Failed to load lab tests");
    }
  }

  displayLabTests(tests) {
    const tbody = document.getElementById("lab-tests-table-body");
    if (!tbody) {
      console.error("❌ Lab tests table body not found");
      return;
    }

    if (tests.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align: center;">No lab tests found</td></tr>';
      return;
    }

    tbody.innerHTML = tests
      .map(
        (test) => `
        <tr>
            <td>${test.test_id}</td>
            <td>${test.test_name}</td>
            <td>${test.category || "N/A"}</td>
            <td>$${test.price}</td>
            <td>${test.turnaround_time || "N/A"}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="app.editLabTest(${
                  test.id
                })">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="app.deleteLabTest(${
                  test.id
                })">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `
      )
      .join("");
  }

  async searchLabTests() {
    const query = document.getElementById("lab-test-search").value.trim();
    if (!query) {
      this.loadLabTests();
      return;
    }

    try {
      const response = await this.apiCall(
        `/lab-tests/search?q=${encodeURIComponent(query)}`
      );
      this.displayLabTests(response.data || []);
    } catch (error) {
      this.showError("Failed to search lab tests");
    }
  }

  showLabTestModal(test = null) {
    this.currentLabTestId = test ? test.id : null;
    const modal = document.getElementById("lab-test-modal");
    const title = document.getElementById("lab-test-modal-title");
    const form = document.getElementById("lab-test-form");

    if (test) {
      title.textContent = "Edit Lab Test";
      Object.keys(test).forEach((key) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = test[key] || "";
      });
    } else {
      title.textContent = "Add New Lab Test";
      form.reset();
    }

    modal.style.display = "block";
  }

  hideLabTestModal() {
    document.getElementById("lab-test-modal").style.display = "none";
    this.currentLabTestId = null;
  }

  async saveLabTest() {
    const form = document.getElementById("lab-test-form");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Convert price to number
    data.price = parseFloat(data.price);

    try {
      if (this.currentLabTestId) {
        await this.apiCall(`/lab-tests/${this.currentLabTestId}`, "PUT", data);
        this.showSuccess("Lab test updated successfully");
      } else {
        await this.apiCall("/lab-tests", "POST", data);
        this.showSuccess("Lab test created successfully");
      }

      this.hideLabTestModal();
      this.loadLabTests();
    } catch (error) {
      this.showError("Failed to save lab test: " + error.message);
    }
  }

  async editLabTest(id) {
    try {
      const response = await this.apiCall(`/lab-tests/${id}`);
      this.showLabTestModal(response.data);
    } catch (error) {
      this.showError("Failed to load lab test data");
    }
  }

  async deleteLabTest(id) {
    if (!confirm("Are you sure you want to delete this lab test?")) return;

    try {
      await this.apiCall(`/lab-tests/${id}`, "DELETE");
      this.showSuccess("Lab test deleted successfully");
      this.loadLabTests();
    } catch (error) {
      this.showError("Failed to delete lab test");
    }
  }

  // async apiCall(endpoint, method = "GET", data = null) {
  //   console.log(`🌐 API Call: ${method} ${endpoint}`, data);

  //   const options = {
  //     method,
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   };

  //   if (data && (method === "POST" || method === "PUT")) {
  //     options.body = JSON.stringify(data);
  //   }

  //   const response = await fetch(`${API_BASE}${endpoint}`, options);

  //   if (!response.ok) {
  //     throw new Error(`HTTP error! status: ${response.status}`);
  //   }

  //   const result = await response.json();

  //   if (!result.success) {
  //     throw new Error(result.message || "API call failed");
  //   }

  //   return result;
  // }

  async apiCall(endpoint, method = "GET", data = null) {
    console.log(`🌐 API Call: ${method} ${endpoint}`, data);

    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (data && (method === "POST" || method === "PUT")) {
        options.body = JSON.stringify(data);
      }

      console.log("📤 Request options:", options);

      const response = await fetch(`${API_BASE}${endpoint}`, options);

      console.log("📥 Response status:", response.status);
      console.log("📥 Response headers:", response.headers);

      let result;
      const responseText = await response.text();
      console.log("📥 Response text:", responseText);

      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("❌ JSON parse error:", jsonError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      console.log(`📨 API Response:`, result);

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`
        );
      }

      if (!result.success) {
        throw new Error(result.message || "API call failed");
      }

      return result;
    } catch (error) {
      console.error(`❌ API Call failed: ${endpoint}`, error);
      throw error;
    }
  }
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
  }

  formatTime(timeString) {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  showSuccess(message) {
    alert(`✅ Success: ${message}`);
  }

  showError(message) {
    alert(`❌ Error: ${message}`);
  }

  // Add this method to your HospitalManagementSystem class
  debugAppointmentDates() {
    console.log("🔍 Debugging appointment dates...");

    // Check all appointments and their dates
    this.apiCall("/appointments")
      .then((response) => {
        const appointments = response.data || [];
        const today = new Date().toISOString().split("T")[0];

        console.log(`📅 Today is: ${today}`);
        console.log("📋 All appointments:");

        appointments.forEach((apt) => {
          // Extract date part from the full datetime string
          const appointmentDate = apt.appointment_date.split("T")[0];
          const isToday = appointmentDate === today;
          console.log(
            `   ${apt.appointment_date} → ${appointmentDate} - ${
              apt.first_name
            } ${apt.last_name} - ${isToday ? "✅ TODAY" : "❌ NOT TODAY"}`
          );
        });

        const todayCount = appointments.filter((apt) => {
          const appointmentDate = apt.appointment_date.split("T")[0];
          return appointmentDate === today;
        }).length;

        console.log(`📊 Today's appointments count: ${todayCount}`);
      })
      .catch((error) => {
        console.error("Error debugging appointments:", error);
      });
  }
  // Add these date utility methods to your HospitalManagementSystem class

  // Consistent date formatting across the entire app
  formatDateForDisplay(dateString) {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    // Handle invalid dates
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateString);
      return "Invalid Date";
    }

    // Format as MM/DD/YYYY (like your appointments table)
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  formatDateForAPI(dateString) {
    if (!dateString) return null;

    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // YYYY-MM-DD format for API
  }

  // For dashboard date comparison (timezone-safe)
  isDateToday(dateString) {
    if (!dateString) return false;

    const inputDate = new Date(dateString);
    const today = new Date();

    return (
      inputDate.getFullYear() === today.getFullYear() &&
      inputDate.getMonth() === today.getMonth() &&
      inputDate.getDate() === today.getDate()
    );
  }

  // For displaying time
  formatTimeForDisplay(timeString) {
    if (!timeString) return "N/A";

    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
  // Test date consistency across the app
  testDateConsistency() {
    console.log("🔄 Testing Date Consistency Across App");

    this.apiCall("/appointments").then((response) => {
      const appointments = response.data || [];

      appointments.forEach((apt) => {
        console.log(`📅 ${apt.first_name} ${apt.last_name}:`);
        console.log(`   Raw: ${apt.appointment_date}`);
        console.log(
          `   Dashboard Format: ${this.formatDateForDisplay(
            apt.appointment_date
          )}`
        );
        console.log(`   Is Today: ${this.isDateToday(apt.appointment_date)}`);
        console.log("---");
      });
    });
  }
}

// Make app globally available for onclick handlers
window.app = new HospitalManagementSystem();
