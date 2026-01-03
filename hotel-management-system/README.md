````markdown
# 🏨 Hotel Management System

A comprehensive hotel management system built with React.js, Node.js, and MySQL. This system provides complete hotel management capabilities including room booking, guest management, housekeeping, payments, and reporting.

## ✨ Features

### 🎯 Core Features

- **Room Management** - Add, view, and manage hotel rooms
- **Guest Management** - Comprehensive guest profiles and history
- **Booking System** - Complete booking lifecycle management
- **Payment Processing** - Integrated payment tracking
- **Housekeeping** - Automated task assignment and tracking
- **Maintenance Requests** - Streamlined maintenance workflow
- **Reporting & Analytics** - Revenue, occupancy, and performance reports
- **Role-Based Access** - Secure multi-user system

### 👥 User Roles

- **Administrator** - Full system access
- **Manager** - Management and reporting access
- **Receptionist** - Front desk operations
- **Housekeeping** - Cleaning and maintenance tasks

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- XAMPP (recommended for easy setup)

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd hotel-management-system
   ```
````

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

3. **Database Setup**

   - Start XAMPP and ensure MySQL is running
   - Open phpMyAdmin (http://localhost/phpmyadmin)
   - Create a new database named `hotel_management`
   - Import the SQL schema from `database/hotel_system.sql`

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. **Start Backend Server**

   ```bash
   cd backend
   npm run dev
   ```

   Server runs on http://localhost:5000

2. **Start Frontend Development Server**

   ```bash
   cd frontend
   npm start
   ```

   Application runs on http://localhost:3000

3. **Access the System**
   - Open http://localhost:3000 in your browser
   - Use demo credentials to login

## 🔐 Demo Credentials

| Role          | Username    | Password   | Access              |
| ------------- | ----------- | ---------- | ------------------- |
| Administrator | admin       | admin123   | Full system access  |
| Manager       | manager     | manager123 | Management features |
| Housekeeping  | housekeeper | clean123   | Cleaning tasks only |

## 🗄️ Database Schema

The system uses the following main tables:

- `rooms` - Room inventory and status
- `guests` - Guest information and history
- `bookings` - Reservation records
- `payments` - Payment transactions
- `users` - System users and authentication
- `housekeeping_tasks` - Cleaning and maintenance tasks
- `maintenance_requests` - Maintenance issue tracking

## 🛠️ Technology Stack

### Frontend

- **React.js** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling and responsive design

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Development Tools

- **XAMPP** - Local development server
- **phpMyAdmin** - Database management
- **Nodemon** - Development server auto-restart

## 📱 System Modules

### 1. Dashboard

- Real-time hotel statistics
- Quick overview of bookings and occupancy
- Today's arrivals and departures

### 2. Room Management

- Add and manage rooms
- Room status tracking (available, occupied, maintenance)
- Search and filter capabilities

### 3. Guest Management

- Comprehensive guest profiles
- Contact information and preferences
- Booking history

### 4. Booking System

- Create new bookings
- Check-in/check-out processing
- Payment tracking
- Booking modifications

### 5. Housekeeping

- Automated task assignment
- Room cleaning scheduling
- Maintenance request tracking
- Staff productivity monitoring

### 6. Reporting

- Revenue reports
- Occupancy analytics
- Guest statistics
- Performance metrics

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Bookings

- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id/checkin` - Check-in guest
- `PUT /api/bookings/:id/checkout` - Check-out guest

### Rooms

- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/available` - Get available rooms
- `POST /api/rooms` - Add new room

### Housekeeping

- `GET /api/housekeeping/tasks` - Get all tasks
- `POST /api/housekeeping/tasks` - Create new task
- `POST /api/housekeeping/maintenance` - Report maintenance issue

### Reports

- `GET /api/reports/revenue` - Revenue analytics
- `GET /api/reports/occupancy` - Occupancy rates
- `GET /api/reports/guests` - Guest statistics

## 🎨 Customization

### Adding New Room Types

Update the room type enum in the database and frontend components.

### Modifying User Roles

Edit the role permissions in the authentication middleware.

### Custom Reports

Add new report endpoints in the backend and corresponding frontend components.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
