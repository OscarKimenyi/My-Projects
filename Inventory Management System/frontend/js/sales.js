async function loadSales() {
  try {
    const sales = await apiCall("/sales");
    displaySales(sales);
  } catch (error) {
    console.error("Error loading sales:", error);
    alert("Error loading sales: " + error.message);
  }
}

function displaySales(sales) {
  const tbody = document.getElementById("sales-tbody");
  if (!tbody) {
    console.error("Sales table body not found");
    return;
  }

  tbody.innerHTML = sales
    .map(
      (sale) => `
        <tr>
            <td>${sale.product_name}</td>
            <td>${sale.quantity}</td>
            <td>$${parseFloat(sale.unit_price).toFixed(2)}</td>
            <td>$${parseFloat(sale.total_price).toFixed(2)}</td>
            <td>${sale.customer_name || "N/A"}</td>
            <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
        </tr>
    `
    )
    .join("");
}

function openSaleModal() {
  const modal = document.getElementById("sale-modal");
  const form = document.getElementById("sale-form");

  if (!modal || !form) {
    console.error("Sale modal elements not found");
    return;
  }

  form.reset();
  document.getElementById("sale-date").value = new Date()
    .toISOString()
    .split("T")[0];

  // Load products for dropdown
  loadProductsForSaleSelect();

  modal.style.display = "block";
}

// Load products for sale dropdown
async function loadProductsForSaleSelect() {
  try {
    const products = await apiCall("/products");
    const select = document.getElementById("sale-product");
    if (select) {
      select.innerHTML =
        '<option value="">Select Product</option>' +
        products
          .map(
            (product) =>
              `<option value="${product.id}" data-price="${product.price}">${product.name} (Stock: ${product.stock_quantity})</option>`
          )
          .join("");

      // Set up price auto-fill
      select.addEventListener("change", function () {
        const selectedOption = this.options[this.selectedIndex];
        const price = selectedOption.getAttribute("data-price");
        if (price) {
          document.getElementById("sale-unit-price").value = price;
        }
      });
    }
  } catch (error) {
    console.error("Error loading products for sale select:", error);
  }
}

// Sale form submission
document
  .getElementById("sale-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const saleData = {
      product_id: document.getElementById("sale-product").value,
      quantity: parseInt(document.getElementById("sale-quantity").value),
      unit_price: parseFloat(document.getElementById("sale-unit-price").value),
      total_price:
        parseInt(document.getElementById("sale-quantity").value) *
        parseFloat(document.getElementById("sale-unit-price").value),
      sale_date: document.getElementById("sale-date").value,
      customer_name: document.getElementById("sale-customer").value,
      notes: document.getElementById("sale-notes").value,
    };

    try {
      await apiCall("/sales", {
        method: "POST",
        body: JSON.stringify(saleData),
      });

      document.getElementById("sale-modal").style.display = "none";
      loadSales();
      loadProducts();
      loadDashboardData();
      alert("Sale recorded successfully! Stock updated.");
    } catch (error) {
      console.error("Error saving sale:", error);
      alert("Error saving sale: " + error.message);
    }
  });
