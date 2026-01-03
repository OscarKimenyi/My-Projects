async function loadSuppliers() {
  try {
    const suppliers = await apiCall("/suppliers");
    displaySuppliers(suppliers);
  } catch (error) {
    console.error("Error loading suppliers:", error);
    alert("Error loading suppliers: " + error.message);
  }
}

function displaySuppliers(suppliers) {
  const tbody = document.getElementById("suppliers-tbody");
  if (!tbody) {
    console.error("Suppliers table body not found");
    return;
  }

  tbody.innerHTML = suppliers
    .map(
      (supplier) => `
        <tr>
            <td>${supplier.name}</td>
            <td>${supplier.contact_person || "N/A"}</td>
            <td>${supplier.email || "N/A"}</td>
            <td>${supplier.phone || "N/A"}</td>
            <td>
                <button class="btn btn-primary" onclick="editSupplier(${
                  supplier.id
                })">Edit</button>
                <button class="btn btn-danger" onclick="deleteSupplier(${
                  supplier.id
                })">Delete</button>
            </td>
        </tr>
    `
    )
    .join("");
}

function openSupplierModal(supplierId = null) {
  const modal = document.getElementById("supplier-modal");
  const title = document.getElementById("supplier-modal-title");
  const form = document.getElementById("supplier-form");

  if (!modal || !title || !form) {
    console.error("Supplier modal elements not found");
    return;
  }

  form.reset();
  document.getElementById("supplier-id").value = "";

  if (supplierId) {
    title.textContent = "Edit Supplier";
    loadSupplierData(supplierId);
  } else {
    title.textContent = "Add Supplier";
  }

  modal.style.display = "block";
}

async function loadSupplierData(supplierId) {
  try {
    const supplier = await apiCall(`/suppliers/${supplierId}`);
    if (supplier) {
      document.getElementById("supplier-id").value = supplier.id;
      document.getElementById("supplier-name").value = supplier.name;
      document.getElementById("supplier-contact").value =
        supplier.contact_person || "";
      document.getElementById("supplier-email").value = supplier.email || "";
      document.getElementById("supplier-phone").value = supplier.phone || "";
      document.getElementById("supplier-address").value =
        supplier.address || "";
    }
  } catch (error) {
    console.error("Error loading supplier data:", error);
    alert("Error loading supplier data: " + error.message);
  }
}

// Supplier form submission
document
  .getElementById("supplier-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const supplierData = {
      name: document.getElementById("supplier-name").value,
      contact_person: document.getElementById("supplier-contact").value,
      email: document.getElementById("supplier-email").value,
      phone: document.getElementById("supplier-phone").value,
      address: document.getElementById("supplier-address").value,
    };

    const supplierId = document.getElementById("supplier-id").value;

    try {
      if (supplierId) {
        await apiCall(`/suppliers/${supplierId}`, {
          method: "PUT",
          body: JSON.stringify(supplierData),
        });
        alert("Supplier updated successfully!");
      } else {
        await apiCall("/suppliers", {
          method: "POST",
          body: JSON.stringify(supplierData),
        });
        alert("Supplier created successfully!");
      }

      document.getElementById("supplier-modal").style.display = "none";
      loadSuppliers();
      loadSuppliersForSelect(); // Refresh product form supplier dropdown
    } catch (error) {
      console.error("Error saving supplier:", error);
      alert("Error saving supplier: " + error.message);
    }
  });

async function editSupplier(supplierId) {
  openSupplierModal(supplierId);
}

async function deleteSupplier(supplierId) {
  if (confirm("Are you sure you want to delete this supplier?")) {
    try {
      await apiCall(`/suppliers/${supplierId}`, {
        method: "DELETE",
      });
      alert("Supplier deleted successfully!");
      loadSuppliers();
      loadSuppliersForSelect(); // Refresh dropdowns
    } catch (error) {
      console.error("Error deleting supplier:", error);
      alert("Error deleting supplier: " + error.message);
    }
  }
}
