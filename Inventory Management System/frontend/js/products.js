let allProducts = [];

async function loadProducts() {
  try {
    allProducts = await apiCall("/products");
    displayProducts(allProducts);
  } catch (error) {
    console.error("Error loading products:", error);
    alert("Error loading products: " + error.message);
  }
}

function displayProducts(products) {
  const tbody = document.getElementById("products-tbody");
  if (!tbody) {
    console.error("Products table body not found");
    return;
  }

  tbody.innerHTML = products
    .map(
      (product) => `
        <tr>
            <td>${product.name}</td>
            <td>${product.sku}</td>
            <td>${product.category || "N/A"}</td>
            <td>$${parseFloat(product.price).toFixed(2)}</td>
            <td>
                <span class="${
                  product.stock_quantity <= product.min_stock_level
                    ? "stock-alert warning"
                    : ""
                }">
                    ${product.stock_quantity}
                    ${
                      product.stock_quantity <= product.min_stock_level
                        ? "⚠️"
                        : ""
                    }
                </span>
            </td>
            <td>${product.supplier_name || "N/A"}</td>
            <td>
                <button class="btn btn-primary" onclick="editProduct(${
                  product.id
                })">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct(${
                  product.id
                })">Delete</button>
            </td>
        </tr>
    `
    )
    .join("");
}

function searchProducts() {
  const query = document.getElementById("product-search").value.toLowerCase();
  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(query) ||
      (product.sku && product.sku.toLowerCase().includes(query)) ||
      (product.description &&
        product.description.toLowerCase().includes(query)) ||
      (product.category && product.category.toLowerCase().includes(query))
  );
  displayProducts(filteredProducts);
}

// Updated to work with multiple select elements
async function loadSuppliersForSelect(selectId = "product-supplier") {
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

function openProductModal(productId = null) {
  const modal = document.getElementById("product-modal");
  const title = document.getElementById("product-modal-title");
  const form = document.getElementById("product-form");

  if (!modal || !title || !form) {
    console.error("Product modal elements not found");
    return;
  }

  form.reset();
  document.getElementById("product-id").value = "";

  if (productId) {
    title.textContent = "Edit Product";
    loadProductData(productId);
  } else {
    title.textContent = "Add Product";
  }

  // Load suppliers for dropdown
  loadSuppliersForSelect();

  modal.style.display = "block";
}

async function loadProductData(productId) {
  try {
    const product = await apiCall(`/products/${productId}`);
    if (product) {
      document.getElementById("product-id").value = product.id;
      document.getElementById("product-name").value = product.name;
      document.getElementById("product-description").value =
        product.description || "";
      document.getElementById("product-sku").value = product.sku;
      document.getElementById("product-category").value =
        product.category || "";
      document.getElementById("product-price").value = product.price;
      document.getElementById("product-cost").value = product.cost;
      document.getElementById("product-stock").value = product.stock_quantity;
      document.getElementById("product-min-stock").value =
        product.min_stock_level;
      document.getElementById("product-supplier").value =
        product.supplier_id || "";
    }
  } catch (error) {
    console.error("Error loading product data:", error);
    alert("Error loading product data: " + error.message);
  }
}

// Product form submission
document
  .getElementById("product-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const productData = {
      name: document.getElementById("product-name").value,
      description: document.getElementById("product-description").value,
      sku: document.getElementById("product-sku").value,
      category: document.getElementById("product-category").value,
      price: parseFloat(document.getElementById("product-price").value),
      cost: parseFloat(document.getElementById("product-cost").value),
      stock_quantity: parseInt(document.getElementById("product-stock").value),
      min_stock_level: parseInt(
        document.getElementById("product-min-stock").value
      ),
      supplier_id: document.getElementById("product-supplier").value || null,
    };

    const productId = document.getElementById("product-id").value;

    try {
      if (productId) {
        await apiCall(`/products/${productId}`, {
          method: "PUT",
          body: JSON.stringify(productData),
        });
        alert("Product updated successfully!");
      } else {
        await apiCall("/products", {
          method: "POST",
          body: JSON.stringify(productData),
        });
        alert("Product created successfully!");
      }

      document.getElementById("product-modal").style.display = "none";
      loadProducts();
      loadDashboardData();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product: " + error.message);
    }
  });

async function editProduct(productId) {
  openProductModal(productId);
}

async function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      await apiCall(`/products/${productId}`, {
        method: "DELETE",
      });
      alert("Product deleted successfully!");
      loadProducts();
      loadDashboardData();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product: " + error.message);
    }
  }
}
