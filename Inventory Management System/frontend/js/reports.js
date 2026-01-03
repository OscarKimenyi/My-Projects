function generateMonthlyReport() {
  // Create and show report modal
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.display = "block";
  modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>Monthly Sales Report</h3>
            <div class="form-group">
                <label for="report-month">Select Month:</label>
                <input type="month" id="report-month" value="${new Date()
                  .toISOString()
                  .slice(0, 7)}">
            </div>
            <div id="report-content">
                <p>Select a month and click Generate to view the report.</p>
            </div>
            <div class="form-actions">
                <button class="btn btn-primary" onclick="loadReportData()">Generate Report</button>
                <button class="btn btn-secondary" onclick="printReport()" style="display: none;" id="print-btn">Print Report</button>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  // Load initial report data
  loadReportData();
}

async function loadReportData() {
  const monthInput = document.getElementById("report-month");
  const [year, month] = monthInput.value.split("-");

  try {
    const response = await fetch(
      `${API_BASE}/reports/monthly?month=${month}&year=${year}`
    );
    const report = await response.json();

    const reportContent = document.getElementById("report-content");
    reportContent.innerHTML = `
            <div class="report-header">
                <h4>Sales Report for ${report.period}</h4>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="report-summary">
                <div class="summary-grid">
                    <div class="summary-card">
                        <h5>Total Sales</h5>
                        <p class="amount">$${report.summary.totalSales.toFixed(
                          2
                        )}</p>
                    </div>
                    <div class="summary-card">
                        <h5>Total Cost</h5>
                        <p class="amount">$${report.summary.totalCost.toFixed(
                          2
                        )}</p>
                    </div>
                    <div class="summary-card">
                        <h5>Total Profit</h5>
                        <p class="amount profit">$${report.summary.totalProfit.toFixed(
                          2
                        )}</p>
                    </div>
                    <div class="summary-card">
                        <h5>Profit Margin</h5>
                        <p class="amount">${report.summary.profitMargin}%</p>
                    </div>
                </div>
            </div>

            <div class="report-section">
                <h5>Top Selling Products</h5>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Units Sold</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.topProducts
                          .map(
                            (product) => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.total_sold}</td>
                                <td>$${parseFloat(
                                  product.total_revenue
                                ).toFixed(2)}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>

            <div class="report-section">
                <h5>Sales Transactions</h5>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th>Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.sales
                          .map(
                            (sale) => `
                            <tr>
                                <td>${new Date(
                                  sale.sale_date
                                ).toLocaleDateString()}</td>
                                <td>${sale.product_name}</td>
                                <td>${sale.quantity}</td>
                                <td>$${sale.unit_price.toFixed(2)}</td>
                                <td>$${sale.total_price.toFixed(2)}</td>
                                <td class="${
                                  sale.profit >= 0 ? "profit" : "loss"
                                }">$${sale.profit.toFixed(2)}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>

            <div class="report-section">
                <h5>Purchase Transactions</h5>
                <table class="report-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Unit Cost</th>
                            <th>Total Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.purchases
                          .map(
                            (purchase) => `
                            <tr>
                                <td>${new Date(
                                  purchase.purchase_date
                                ).toLocaleDateString()}</td>
                                <td>${purchase.product_name}</td>
                                <td>${purchase.quantity}</td>
                                <td>$${purchase.unit_cost.toFixed(2)}</td>
                                <td>$${purchase.total_cost.toFixed(2)}</td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;

    // Show print button
    document.getElementById("print-btn").style.display = "inline-block";
  } catch (error) {
    console.error("Error loading report:", error);
    document.getElementById("report-content").innerHTML = `
            <div class="alert alert-danger">
                Error loading report: ${error.message}
            </div>
        `;
  }
}

function printReport() {
  const reportContent = document.getElementById("report-content");
  const printWindow = window.open("", "_blank");

  printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Monthly Sales Report</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .report-header { text-align: center; margin-bottom: 30px; }
                .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
                .summary-card { border: 1px solid #ddd; padding: 15px; text-align: center; border-radius: 5px; }
                .amount { font-size: 18px; font-weight: bold; margin: 5px 0; }
                .profit { color: #27ae60; }
                .loss { color: #e74c3c; }
                .report-section { margin: 30px 0; }
                .report-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                .report-table th, .report-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .report-table th { background-color: #f8f9fa; }
                @media print {
                    .summary-grid { grid-template-columns: repeat(2, 1fr); }
                }
            </style>
        </head>
        <body>
            ${reportContent.innerHTML}
        </body>
        </html>
    `);

  printWindow.document.close();
  printWindow.print();
}
