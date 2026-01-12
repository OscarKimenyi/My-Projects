import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const roomService = {
  getAllRooms: () => api.get("/rooms"),
  getAvailableRooms: () => api.get("/rooms/available"),
  addRoom: (roomData) => api.post("/rooms", roomData),
};

export const guestService = {
  getAllGuests: () => api.get("/guests"),
  addGuest: (guestData) => api.post("/guests", guestData),
  searchGuests: (query) => api.get(`/guests/search/${query}`),
};

export const bookingService = {
  getAllBookings: () => api.get("/bookings"),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (bookingData) => api.post("/bookings", bookingData),
  checkIn: (bookingId) => api.put(`/bookings/${bookingId}/checkin`),
  checkOut: (bookingId) => api.put(`/bookings/${bookingId}/checkout`),
  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`),
  updateBooking: (bookingId, bookingData) =>
    api.put(`/bookings/${bookingId}`, bookingData),
  searchBookings: (query) => api.get(`/bookings/search/${query}`),
  filterBookings: (status) => api.get(`/bookings/filter/${status}`),
  getBookingStats: () => api.get("/bookings/stats/dashboard"),
  getTodayMovements: () => api.get("/bookings/today/movements"),
};

export const paymentService = {
  processPayment: (paymentData) => api.post("/payments/process", paymentData),
  getPaymentsByBooking: (bookingId) =>
    api.get(`/payments/booking/${bookingId}`),
};

export const reportService = {
  getRevenue: (dateRange) => api.get("/reports/revenue", { params: dateRange }),
  getOccupancy: () => api.get("/reports/occupancy"),
  getGuestStats: () => api.get("/reports/guests"),
};

// Auth service
export const authService = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
};

export const housekeepingService = {
  getTasks: () => api.get("/housekeeping/tasks"),
  getStaffTasks: (staffId) => api.get(`/housekeeping/tasks/staff/${staffId}`),
  createTask: (taskData) => api.post("/housekeeping/tasks", taskData),
  updateTaskStatus: (taskId, status) =>
    api.put(`/housekeeping/tasks/${taskId}/status`, { status }),
  getMaintenanceRequests: () => api.get("/housekeeping/maintenance"),
  createMaintenanceRequest: (requestData) =>
    api.post("/housekeeping/maintenance", requestData),
  assignMaintenance: (requestId, staffId) =>
    api.put(`/housekeeping/maintenance/${requestId}/assign`, {
      assigned_to: staffId,
    }),
  updateMaintenanceStatus: (requestId, status) =>
    api.put(`/housekeeping/maintenance/${requestId}/status`, { status }),
  getStaff: () => api.get("/housekeeping/staff"),
  getDashboardStats: () => api.get("/housekeeping/dashboard"),
};
export default api;
