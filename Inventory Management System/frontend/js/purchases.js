async function loadPurchases() {
  try {
    const purchases = await apiCall("/purchases");
    displayPurchases(purchases);
  } catch (error) {
    console.error("Error loading purchases:", error);
    alert("Error loading purchases: " + error.message);
  }
}

function displayPurchases(purchases) {
  const tbody = document.getElementById("purchases-tbody");
  if (!tbody) {
    console.error("Purchases table body not found");
    return;
  }

  tbody.innerHTML = purchases
    .map(
      (purchase) => `
        <tr>
            <td>${purchase.product_name}</td>
            <td>${purchase.supplier_name}</td>
            <td>${purchase.quantity}</td>
            <td>$${parseFloat(purchase.unit_cost).toFixed(2)}</td>
            <td>$${parseFloat(purchase.total_cost).toFixed(2)}</td>
            <td>${new Date(purchase.purchase_date).toLocaleDateString()}</td>
        </tr>
    `
    )
    .join("");
}

function openPurchaseModal() {
  const modal = document.getElementById("purchase-modal");
  const form = document.getElementById("purchase-form");

  if (!modal || !form) {
    console.error("Purchase modal elements not found");
    return;
  }

  form.reset();
  document.getElementById("purchase-date").value = new Date()
    .toISOString()
    .split("T")[0];

  // Load products and suppliers for dropdowns
  loadProductsForSelect("purchase-product");
  loadSuppliersForSelect("purchase-supplier");

  modal.style.display = "block";
}

// Purchase form submission
document
  .getElementById("purchase-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const purchaseData = {
      product_id: document.getElementById("purchase-product").value,
      supplier_id: document.getElementById("purchase-supplier").value,
      quantity: parseInt(document.getElementById("purchase-quantity").value),
      unit_cost: parseFloat(
        document.getElementById("purchase-unit-cost").value
      ),
      total_cost:
        parseInt(document.getElementById("purchase-quantity").value) *
        parseFloat(document.getElementById("purchase-unit-cost").value),
      purchase_date: document.getElementById("purchase-date").value,
      notes: document.getElementById("purchase-notes").value,
    };

    try {
      await apiCall("/purchases", {
        method: "POST",
        body: JSON.stringify(purchaseData),
      });

      document.getElementById("purchase-modal").style.display = "none";
      loadPurchases();
      loadProducts();
      loadDashboardData();
      alert("Purchase added successfully! Stock updated.");
    } catch (error) {
      console.error("Error saving purchase:", error);
      alert("Error saving purchase: " + error.message);
    }
  });

// Load products for purchase dropdown
async function loadProductsForSelect(selectId) {
  try {
    const products = await apiCall("/products");
    const select = document.getElementById(selectId);
    if (select) {
      select.innerHTML =
        '<option value="">Select Product</option>' +
        products
          .map(
            (product) =>
              `<option value="${product.id}">${product.name} (Stock: ${product.stock_quantity})</option>`
          )
          .join("");
    }
  } catch (error) {
    console.error("Error loading products for select:", error);
  }
}

// Load suppliers for purchase dropdown
async function loadSuppliersForSelect(selectId) {
  try {
    const suppliers = await apiCall("/suppliers");
    const select = document.getElementById(selectId);
    if (select) {
      select.innerHTML =
        '<option value="">Select Supplier</option>' +
        suppliers
          .map(
            (supplier) =>
              `<option value="${supplier.id}">${supplier.name}</option>`
          )
          .join("");
    }
  } catch (error) {
    console.error("Error loading suppliers for select:", error);
  }
}
