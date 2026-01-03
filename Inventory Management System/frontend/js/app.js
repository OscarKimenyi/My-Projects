const API_BASE = "http://localhost:3000/api";

// Theme management
function toggleTheme() {
  const body = document.body;
  const themeToggle = document.querySelector(".theme-toggle");

  if (body.classList.contains("dark-theme")) {
    body.classList.remove("dark-theme");
    themeToggle.textContent = "🌙 Dark Mode";
    localStorage.setItem("theme", "light");
  } else {
    body.classList.add("dark-theme");
    themeToggle.textContent = "☀️ Light Mode";
    localStorage.setItem("theme", "dark");
  }
}

// Load saved theme
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  const themeToggle = document.querySelector(".theme-toggle");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️ Light Mode";
  } else {
    document.body.classList.remove("dark-theme");
    themeToggle.textContent = "🌙 Dark Mode";
  }
}

// Navigation
document.addEventListener("DOMContentLoaded", function () {
  // Load saved theme
  loadTheme();

  // Navigation
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetSection = this.getAttribute("data-section");

      // Update active nav link
      navLinks.forEach((nl) => nl.classList.remove("active"));
      this.classList.add("active");

      // Show target section
      sections.forEach((section) => section.classList.remove("active"));
      document.getElementById(targetSection).classList.add("active");

      // Load section data
      loadSectionData(targetSection);
    });
  });

  // Modal functionality
  const modals = document.querySelectorAll(".modal");
  const closeButtons = document.querySelectorAll(".close");

  closeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      this.closest(".modal").style.display = "none";
    });
  });

  window.addEventListener("click", function (e) {
    modals.forEach((modal) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  });

  // Set today's date as default in date fields
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("purchase-date").value = today;
  document.getElementById("sale-date").value = today;

  // Load dashboard data initially
  loadDashboardData();
});

async function loadSectionData(section) {
  switch (section) {
    case "dashboard":
      loadDashboardData();
      break;
    case "products":
      loadProducts();
      loadSuppliersForSelect();
      break;
    case "purchases":
      loadPurchases();
      loadProductsForSelect("purchase-product");
      loadSuppliersForSelect("purchase-supplier");
      break;
    case "sales":
      loadSales();
      loadProductsForSelect("sale-product");
      break;
    case "suppliers":
      loadSuppliers();
      break;
  }
}

async function loadDashboardData() {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats`);
    const data = await response.json();

    document.getElementById("total-products").textContent = data.totalProducts;
    document.getElementById("monthly-sales").textContent = `$${parseFloat(
      data.monthlySales
    ).toFixed(2)}`;
    document.getElementById("low-stock-items").textContent = data.lowStockItems;

    // Load recent sales
    const recentSalesList = document.getElementById("recent-sales-list");
    recentSalesList.innerHTML = data.recentSales
      .map(
        (sale) => `
            <div class="sale-item">
                <div class="product-name">${sale.product_name}</div>
                <div class="sale-info">
                    ${sale.quantity} x $${parseFloat(sale.unit_price).toFixed(
          2
        )} = $${parseFloat(sale.total_price).toFixed(2)}
                </div>
                <div class="sale-date">${new Date(
                  sale.sale_date
                ).toLocaleDateString()}</div>
            </div>
        `
      )
      .join("");

    // Load low stock alerts
    const lowStockResponse = await fetch(`${API_BASE}/products/low-stock`);
    const lowStockProducts = await lowStockResponse.json();

    const lowStockList = document.getElementById("low-stock-list");
    lowStockList.innerHTML = lowStockProducts
      .map(
        (product) => `
            <div class="stock-alert ${
              product.stock_quantity === 0 ? "danger" : "warning"
            }">
                <span>${product.name}</span>
                <span>Stock: ${product.stock_quantity}</span>
            </div>
        `
      )
      .join("");
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

// Utility function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });
    return await response.json();
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
}

// Load products for select dropdowns
async function loadProductsForSelect(selectId) {
  try {
    const products = await apiCall("/products");
    const select = document.getElementById(selectId);
    select.innerHTML =
      '<option value="">Select Product</option>' +
      products
        .map(
          (product) =>
            `<option value="${product.id}" data-price="${product.price}">${product.name} (Stock: ${product.stock_quantity})</option>`
        )
        .join("");
  } catch (error) {
    console.error("Error loading products for select:", error);
  }
}
