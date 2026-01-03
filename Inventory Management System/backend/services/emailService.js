const nodemailer = require("nodemailer");
const pool = require("../config/database");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendLowStockNotification(product) {
    const subject = `Low Stock Alert: ${product.name}`;
    const html = `
            <h2>Low Stock Alert</h2>
            <p>Product <strong>${product.name}</strong> is running low on stock.</p>
            <ul>
                <li>Current Stock: ${product.stock_quantity}</li>
                <li>Minimum Required: ${product.min_stock_level}</li>
                <li>SKU: ${product.sku}</li>
            </ul>
            <p>Please consider restocking this product soon.</p>
            <hr>
            <p><small>This is an automated message from Inventory Management System</small></p>
        `;

    return await this.sendEmail({
      to: process.env.NOTIFICATION_EMAIL,
      subject,
      html,
    });
  }

  async sendMonthlyReport(email, reportData) {
    const subject = `Monthly Inventory Report - ${reportData.period}`;
    const html = `
            <h2>Monthly Inventory Report</h2>
            <p>Period: <strong>${reportData.period}</strong></p>
            
            <h3>Summary</h3>
            <ul>
                <li>Total Sales: $${reportData.summary.totalSales.toFixed(
                  2
                )}</li>
                <li>Total Profit: $${reportData.summary.totalProfit.toFixed(
                  2
                )}</li>
                <li>Profit Margin: ${reportData.summary.profitMargin}%</li>
                <li>Low Stock Items: ${reportData.lowStockCount || 0}</li>
            </ul>

            <h3>Top Selling Products</h3>
            <ul>
                ${reportData.topProducts
                  .map(
                    (product) => `
                    <li>${product.name}: ${
                      product.total_sold
                    } units ($${parseFloat(product.total_revenue).toFixed(
                      2
                    )})</li>
                `
                  )
                  .join("")}
            </ul>

            <hr>
            <p><small>Generated automatically by Inventory Management System</small></p>
        `;

    return await this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  async sendEmail(mailOptions) {
    try {
      if (!process.env.SMTP_USER) {
        console.log("Email not configured. Would send:", mailOptions);
        return { success: true, message: "Email simulated (not configured)" };
      }

      const result = await this.transporter.sendMail({
        from: `"Inventory System" <${process.env.SMTP_USER}>`,
        ...mailOptions,
      });

      console.log("Email sent successfully:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
