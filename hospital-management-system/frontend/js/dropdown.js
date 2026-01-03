// Dropdown functionality
class DropdownManager {
  static init() {
    const dropdown = document.getElementById("user-dropdown");
    const overlay = document.getElementById("dropdown-overlay");

    if (!dropdown) return;

    // Toggle dropdown on click
    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
      overlay.style.display = dropdown.classList.contains("active")
        ? "block"
        : "none";
    });

    // Close dropdown when clicking outside
    overlay.addEventListener("click", () => {
      dropdown.classList.remove("active");
      overlay.style.display = "none";
    });

    // Close dropdown when clicking on dropdown items
    const dropdownItems = dropdown.querySelectorAll(".dropdown-content a");
    dropdownItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.remove("active");
        overlay.style.display = "none";
      });
    });

    // Close dropdown when pressing Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        dropdown.classList.remove("active");
        overlay.style.display = "none";
      }
    });
  }
}

// Modal functionality
class ModalManager {
  static init() {
    this.setupProfileModal();
    this.setupPasswordModal();
    this.setupLogout();
  }

  static setupProfileModal() {
    const profileBtn = document.getElementById("profile-btn");
    const profileModal = document.getElementById("profile-modal");
    const cancelProfile = document.getElementById("cancel-profile");
    const profileForm = document.getElementById("profile-form");

    if (!profileBtn) return;

    profileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.loadProfileData();
      profileModal.style.display = "block";
    });

    cancelProfile.addEventListener("click", () => {
      profileModal.style.display = "none";
    });

    profileForm.addEventListener("submit", this.updateProfile.bind(this));

    // Close modal when clicking outside
    profileModal.addEventListener("click", (e) => {
      if (e.target === profileModal) {
        profileModal.style.display = "none";
      }
    });
  }

  static setupPasswordModal() {
    const passwordBtn = document.getElementById("change-password-btn");
    const passwordModal = document.getElementById("change-password-modal");
    const cancelPassword = document.getElementById("cancel-password");
    const passwordForm = document.getElementById("change-password-form");

    if (!passwordBtn) return;

    passwordBtn.addEventListener("click", (e) => {
      e.preventDefault();
      passwordModal.style.display = "block";
    });

    cancelPassword.addEventListener("click", () => {
      passwordModal.style.display = "none";
      passwordForm.reset();
    });

    passwordForm.addEventListener("submit", this.changePassword.bind(this));

    // Close modal when clicking outside
    passwordModal.addEventListener("click", (e) => {
      if (e.target === passwordModal) {
        passwordModal.style.display = "none";
        passwordForm.reset();
      }
    });
  }

  static setupLogout() {
    const logoutBtn = document.getElementById("logout-btn");

    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to logout?")) {
        AuthManager.logout();
      }
    });
  }

  static async loadProfileData() {
    try {
      const user = AuthManager.getUser();
      if (user) {
        document.getElementById("profile-first-name").value =
          user.first_name || "";
        document.getElementById("profile-last-name").value =
          user.last_name || "";
        document.getElementById("profile-email").value = user.email || "";
        document.getElementById("profile-phone").value = user.phone || "";
        document.getElementById("profile-department").value =
          user.department || "";
        document.getElementById("profile-username").value = user.username || "";
        document.getElementById("profile-role").value = user.role || "";
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  static async updateProfile(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      // Remove readonly fields
      delete data.username;
      delete data.role;

      const response = await apiCall("/auth/profile", "PUT", data);

      if (response.success) {
        alert("Profile updated successfully!");
        document.getElementById("profile-modal").style.display = "none";

        // Update local storage
        const user = AuthManager.getUser();
        const updatedUser = { ...user, ...data };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // Update UI
        AuthManager.updateUI(updatedUser);
      }
    } catch (error) {
      alert("Error updating profile: " + error.message);
    }
  }

  static async changePassword(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (data.newPassword !== data.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    try {
      const response = await apiCall("/auth/change-password", "POST", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.success) {
        alert("Password changed successfully!");
        document.getElementById("change-password-modal").style.display = "none";
        e.target.reset();
      }
    } catch (error) {
      alert("Error changing password: " + error.message);
    }
  }
}

// Update your AuthManager to include modal initialization
class AuthManager {
  static checkAuth() {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      window.location.href = "index.html";
      return null;
    }

    try {
      const userData = JSON.parse(user);
      this.updateUI(userData);

      // Initialize modals after auth check
      ModalManager.init();

      return userData;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "index.html";
      return null;
    }
  }
}
// Initialize dropdown when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  DropdownManager.init();
});
