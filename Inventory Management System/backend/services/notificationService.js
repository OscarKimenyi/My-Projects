const pool = require("../config/database");
// Temporarily comment out email service
// const emailService = require('./emailService');

class NotificationService {
  async checkLowStock() {
    try {
      const [lowStockProducts] = await pool.execute(`
                SELECT p.*, s.name as supplier_name, s.email as supplier_email
                FROM products p 
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                WHERE p.stock_quantity <= p.min_stock_level
            `);

      const notifications = [];

      for (const product of lowStockProducts) {
        // Simulate email notification instead of sending
        console.log("Low stock alert:", {
          product: product.name,
          currentStock: product.stock_quantity,
          minStock: product.min_stock_level,
        });

        notifications.push({
          productId: product.id,
          productName: product.name,
          currentStock: product.stock_quantity,
          minStock: product.min_stock_level,
          emailSent: false, // Set to false since we're not actually sending
          timestamp: new Date(),
        });

        // Log notification
        await this.logNotification({
          type: "low_stock",
          productId: product.id,
          message: `Low stock alert for ${product.name}`,
          data: JSON.stringify({
            currentStock: product.stock_quantity,
            minStock: product.min_stock_level,
          }),
        });
      }

      return notifications;
    } catch (error) {
      console.error("Error checking low stock:", error);
      throw error;
    }
  }

  async logNotification(notification) {
    await pool.execute(
      "INSERT INTO notifications (type, product_id, message, data) VALUES (?, ?, ?, ?)",
      [
        notification.type,
        notification.productId,
        notification.message,
        notification.data,
      ]
    );
  }

  async getNotifications(limit = 50) {
    const [notifications] = await pool.execute(
      `
            SELECT n.*, p.name as product_name 
            FROM notifications n 
            LEFT JOIN products p ON n.product_id = p.id 
            ORDER BY n.created_at DESC 
            LIMIT ?
        `,
      [limit]
    );

    return notifications;
  }
}

module.exports = new NotificationService();
