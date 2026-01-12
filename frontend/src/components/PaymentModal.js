import React, { useState } from "react";
import { paymentService } from "../services/api";
import "../styles/PaymentModal.css";

const PaymentModal = ({ booking, onClose, onPaymentSuccess }) => {
  const [paymentData, setPaymentData] = useState({
    payment_method: "cash",
    amount: booking?.total_amount || 0,
    transaction_id: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentService.processPayment({
        booking_id: booking.id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        transaction_id: paymentData.transaction_id,
        full_amount: booking.total_amount,
      });
      alert("Payment processed successfully!");
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error processing payment. Please try again.");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content payment-modal">
        <h2>Process Payment</h2>
        <div className="payment-info">
          <p>
            <strong>Booking ID:</strong> #{booking.id}
          </p>
          <p>
            <strong>Guest:</strong> {booking.first_name} {booking.last_name}
          </p>
          <p>
            <strong>Total Amount:</strong> ${booking.total_amount}
          </p>
          <p>
            <strong>Due Amount:</strong> ${booking.total_amount}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Payment Method</label>
            <select
              value={paymentData.payment_method}
              onChange={(e) =>
                setPaymentData({
                  ...paymentData,
                  payment_method: e.target.value,
                })
              }
              required
            >
              <option value="cash">Cash</option>
              <option value="card">Credit Card</option>
              <option value="transfer">Bank Transfer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={paymentData.amount}
              onChange={(e) =>
                setPaymentData({ ...paymentData, amount: e.target.value })
              }
              max={booking.total_amount}
              min="1"
              required
            />
          </div>

          {paymentData.payment_method !== "cash" && (
            <div className="form-group">
              <label>Transaction ID</label>
              <input
                type="text"
                placeholder="Enter transaction reference"
                value={paymentData.transaction_id}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    transaction_id: e.target.value,
                  })
                }
                required={paymentData.payment_method !== "cash"}
              />
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Process Payment
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
