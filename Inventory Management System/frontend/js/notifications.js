async function checkLowStock() {
  try {
    const response = await fetch(`${API_BASE}/notifications/check-low-stock`, {
      method: "POST",
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to check low stock");
    }

    alert(
      `Low stock check completed! ${result.notificationsSent} notifications sent.`
    );

    // Refresh the dashboard to show updated low stock alerts
    loadDashboardData();
  } catch (error) {
    console.error("Error checking low stock:", error);
    alert("Error checking low stock: " + error.message);
  }
}

// Add to global scope
window.checkLowStock = checkLowStock;
