class EnhancedReports {
  static async generateProfitLossReport() {
    const startDate = prompt(
      "Enter start date (YYYY-MM-DD):",
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0]
    );
    const endDate = prompt(
      "Enter end date (YYYY-MM-DD):",
      new Date().toISOString().split("T")[0]
    );

    if (!startDate || !endDate) return;

    try {
      const response = await fetch(
        `${API_BASE}/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`
      );
      const report = await response.json();

      if (!response.ok) {
        throw new Error(report.error || "Failed to generate report");
      }

      this.displayProfitLossReport(report, startDate, endDate);
    } catch (error) {
      console.error("Error generating profit-loss report:", error);
      alert("Error generating report: " + error.message);
    }
  }

  static displayProfitLossReport(report, startDate, endDate) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.display = "block";
    modal.innerHTML = `
            <div class="modal-content" style="max-width: 95%; max-height: 90vh; overflow-y: auto;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>Profit & Loss Report</h3>
                <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
                
                ${
                  report.dailySales && report.dailySales.length > 0
                    ? `
                <div class="report-section">
                    <h4>Daily Sales Trend</h4>
                    <div class="table-container">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Sales</th>
                                    <th>Items Sold</th>
                                    <th>Transactions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${report.dailySales
                                  .map(
                                    (day) => `
                                    <tr>
                                        <td>${new Date(
                                          day.date
                                        ).toLocaleDateString()}</td>
                                        <td>$${parseFloat(
                                          day.daily_sales || 0
                                        ).toFixed(2)}</td>
                                        <td>${day.items_sold || 0}</td>
                                        <td>${day.transactions || 0}</td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
                `
                    : "<p>No sales data available for this period.</p>"
                }

                ${
                  report.categoryPerformance &&
                  report.categoryPerformance.length > 0
                    ? `
                <div class="report-section">
                    <h4>Category Performance</h4>
                    <div class="table-container">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Quantity Sold</th>
                                    <th>Revenue</th>
                                    <th>Cost</th>
                                    <th>Profit</th>
                                    <th>Margin</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${report.categoryPerformance
                                  .map((cat) => {
                                    const margin =
                                      cat.revenue > 0
                                        ? ((cat.profit || 0) / cat.revenue) *
                                          100
                                        : 0;
                                    return `
                                        <tr>
                                            <td>${
                                              cat.category || "Uncategorized"
                                            }</td>
                                            <td>${cat.quantity_sold || 0}</td>
                                            <td>$${parseFloat(
                                              cat.revenue || 0
                                            ).toFixed(2)}</td>
                                            <td>$${parseFloat(
                                              cat.cost || 0
                                            ).toFixed(2)}</td>
                                            <td class="${
                                              (cat.profit || 0) >= 0
                                                ? "profit"
                                                : "loss"
                                            }">$${parseFloat(
                                      cat.profit || 0
                                    ).toFixed(2)}</td>
                                            <td>${margin.toFixed(1)}%</td>
                                        </tr>
                                    `;
                                  })
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
                `
                    : ""
                }

                <div class="form-actions">
                    <button class="btn btn-primary" onclick="window.print()">Print Report</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
  }

  static async generateInventoryValuation() {
    try {
      const response = await fetch(`${API_BASE}/reports/inventory-valuation`);
      const report = await response.json();

      if (!response.ok) {
        throw new Error(report.error || "Failed to generate report");
      }

      this.displayInventoryValuation(report);
    } catch (error) {
      console.error("Error generating inventory valuation:", error);
      alert("Error generating report: " + error.message);
    }
  }

  static displayInventoryValuation(report) {
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.style.display = "block";
    modal.innerHTML = `
            <div class="modal-content" style="max-width: 95%; max-height: 90vh; overflow-y: auto;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>Inventory Valuation Report</h3>
                
                <div class="report-summary">
                    <div class="summary-grid">
                        <div class="summary-card">
                            <h5>Total Inventory Value</h5>
                            <p class="amount">$${report.summary.totalValuation.toFixed(
                              2
                            )}</p>
                        </div>
                        <div class="summary-card">
                            <h5>Potential Revenue</h5>
                            <p class="amount">$${report.summary.totalPotentialRevenue.toFixed(
                              2
                            )}</p>
                        </div>
                        <div class="summary-card">
                            <h5>Potential Profit</h5>
                            <p class="amount profit">$${report.summary.totalPotentialProfit.toFixed(
                              2
                            )}</p>
                        </div>
                        <div class="summary-card">
                            <h5>Total Items</h5>
                            <p class="amount">${report.summary.totalItems}</p>
                        </div>
                    </div>
                </div>

                ${
                  report.inventory && report.inventory.length > 0
                    ? `
                <div class="report-section">
                    <h4>Inventory Details</h4>
                    <div class="table-container">
                        <table class="report-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Stock</th>
                                    <th>Cost</th>
                                    <th>Price</th>
                                    <th>Total Value</th>
                                    <th>Potential Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${report.inventory
                                  .map(
                                    (item) => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.stock_quantity}</td>
                                        <td>$${parseFloat(item.cost).toFixed(
                                          2
                                        )}</td>
                                        <td>$${parseFloat(item.price).toFixed(
                                          2
                                        )}</td>
                                        <td>$${parseFloat(
                                          item.total_value || 0
                                        ).toFixed(2)}</td>
                                        <td class="profit">$${parseFloat(
                                          item.potential_profit || 0
                                        ).toFixed(2)}</td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
                `
                    : "<p>No inventory data available.</p>"
                }

                <div class="form-actions">
                    <button class="btn btn-primary" onclick="window.print()">Print Report</button>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);
  }
}

// Add to global scope
window.EnhancedReports = EnhancedReports;
