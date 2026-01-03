# Inventory Management System

A comprehensive, full-stack web application for managing inventory, purchases, sales, and suppliers with real-time tracking, reporting, and analytics.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🎯 Overview

The Inventory Management System is designed to help businesses efficiently track and manage their inventory operations. It provides real-time insights into stock levels, sales performance, supplier management, and financial reporting in an intuitive web interface.

### Key Benefits

- **Real-time Inventory Tracking** - Always know your stock levels
- **Automated Low Stock Alerts** - Never run out of popular items
- **Comprehensive Reporting** - Make data-driven decisions
- **Multi-user Support** - Role-based access control
- **Responsive Design** - Works on desktop and mobile devices

## ✨ Features

### 🏠 Dashboard

- Real-time business overview
- Key performance indicators (KPIs)
- Recent sales activity
- Low stock alerts
- Monthly revenue tracking

### 📦 Products Management

- Add, edit, delete products
- Track stock levels and minimum thresholds
- Barcode scanning support
- Category organization
- Supplier assignment
- Search and filter capabilities

### 🛒 Sales Management

- Process customer sales
- Automatic stock deduction
- Customer information tracking
- Sales history and analytics
- Receipt generation

### 📥 Purchases Management

- Record supplier purchases
- Automatic stock updates
- Purchase cost tracking
- Supplier performance analytics

### 👥 Suppliers Management

- Supplier database
- Contact information management
- Purchase history tracking
- Performance metrics

### 📊 Reporting & Analytics

- Monthly sales reports
- Profit & Loss statements
- Inventory valuation
- Sales trends analysis
- Category performance
- Export capabilities

### ⚙️ Advanced Features

- User authentication & authorization
- Dark/Light theme toggle
- Email notifications for low stock
- Barcode scanning integration
- Responsive web design

## 🛠 Technology Stack

### Frontend

- **HTML5** - Structure and semantics
- **CSS3** - Styling and responsive design
- **JavaScript (ES6+)** - Client-side functionality
- **No Frameworks** - Pure vanilla implementation for performance

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **Docker** - Database containerization

### Key Dependencies

- `mysql2` - MySQL database driver
- `bcryptjs` - Password hashing
- `jsonwebtoken` - Authentication tokens
- `nodemailer` - Email notifications
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment configuration

## 🏗 System Architecture

```
inventory-management-system/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection pool
│   ├── controllers/             # Business logic handlers
│   │   ├── products.js
│   │   ├── sales.js
│   │   ├── purchases.js
│   │   ├── suppliers.js
│   │   └── auth.js
│   ├── models/                  # Data models
│   │   ├── product.js
│   │   ├── sale.js
│   │   ├── purchase.js
│   │   ├── supplier.js
│   │   └── user.js
│   ├── routes/                  # API route definitions
│   │   ├── products.js
│   │   ├── sales.js
│   │   ├── purchases.js
│   │   ├── suppliers.js
│   │   ├── auth.js
│   │   ├── reports.js
│   │   └── notifications.js
│   ├── services/                # Business services
│   │   ├── emailService.js
│   │   └── notificationService.js
│   ├── middleware/              # Custom middleware
│   │   ├── auth.js
│   │   └── validation.js
│   ├── docker-compose.yml       # Database container setup
│   ├── init.sql                 # Database schema & sample data
│   ├── server.js               # Application entry point
│   └── package.json
└── frontend/
    ├── css/
    │   ├── style.css           # Main stylesheet
    │   └── dashboard.css       # Dashboard-specific styles
    ├── js/
    │   ├── app.js              # Main application logic
    │   ├── products.js         # Products management
    │   ├── sales.js            # Sales management
    │   ├── purchases.js        # Purchases management
    │   ├── suppliers.js        # Suppliers management
    │   ├── reports.js          # Reporting functionality
    │   ├── enhanced-reports.js # Advanced reports
    │   ├── notifications.js    # Notification system
    │   └── barcode.js          # Barcode scanning
    └── index.html              # Main application page
```

## 🚀 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
- **Git** - [Download here](https://git-scm.com/)

### Step 1: Clone the Repository

```bash
# Clone the project
git clone <repository-url>
cd inventory-management-system
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=inventory_db
DB_PORT=3306
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret-key-here
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# NOTIFICATION_EMAIL=admin@yourcompany.com
```

### Step 3: Database Setup

```bash
# Start MySQL database using Docker
docker-compose up -d

# Verify database is running
docker ps
```

The database will be initialized with:

- Sample products, suppliers, and categories
- Admin user account
- Required tables and relationships

### Step 4: Start the Backend Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Or production mode
npm start
```

You should see:

```
Server is running on port 3000
API available at http://localhost:3000/api
Database connected successfully
```

### Step 5: Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Start a local web server
# Option 1: Using Python
python -m http.server 8080

# Option 2: Using Node.js http-server
npx http-server -p 8080

# Option 3: Using PHP
php -S localhost:8080
```

### Step 6: Access the Application

1. **Open your web browser**
2. **Navigate to**: `http://localhost:8080`
3. **Login with default credentials**:
   - Email: `admin@inventory.com`
   - Password: `admin123`

## ⚙️ Configuration

### Database Configuration

The system uses MySQL with the following default settings:

- **Host**: `localhost`
- **Port**: `3306`
- **Database**: `inventory_db`
- **Username**: `root`
- **Password**: `password`

### Email Configuration (Optional)

To enable email notifications:

1. **For Gmail**:

   - Enable 2-Factor Authentication
   - Generate an App Password
   - Use the app password in `SMTP_PASS`

2. **Update `.env`**:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NOTIFICATION_EMAIL=admin@yourcompany.com
```

### JWT Configuration

Change the `JWT_SECRET` in production:

```env
JWT_SECRET=very-long-random-string-with-special-characters-2024
```

## 📖 Usage Guide

### 🏠 Dashboard

The dashboard provides an overview of your business:

- **Total Products**: Number of active products in inventory
- **Monthly Sales**: Total sales revenue for current month
- **Low Stock Items**: Products below minimum stock level
- **Recent Sales**: Last 5 sales transactions
- **Low Stock Alerts**: Products needing restocking

### 📦 Managing Products

**Adding a Product:**

1. Click "Products" in navigation
2. Click "Add Product"
3. Fill in product details:
   - Name, Description, SKU
   - Category, Price, Cost
   - Stock Quantity, Minimum Stock Level
   - Supplier
4. Use "Scan Barcode" for barcode input
5. Click "Save Product"

**Editing/Deleting:**

- Click "Edit" to modify product details
- Click "Delete" to remove products (with confirmation)

### 🛒 Processing Sales

**Making a Sale:**

1. Navigate to "Sales" section
2. Click "Add Sale"
3. Select product from dropdown
4. Enter quantity (validates against available stock)
5. Customer name and notes (optional)
6. Click "Save Sale"

**Features:**

- Automatic price population
- Stock level validation
- Customer information tracking
- Automatic stock deduction

### 📥 Recording Purchases

**Adding a Purchase:**

1. Go to "Purchases" section
2. Click "Add Purchase"
3. Select product and supplier
4. Enter quantity and unit cost
5. Add purchase date and notes
6. Click "Save Purchase"

**Benefits:**

- Automatic stock level updates
- Supplier performance tracking
- Cost analysis and reporting

### 👥 Supplier Management

**Adding Suppliers:**

1. Navigate to "Suppliers"
2. Click "Add Supplier"
3. Enter company details:
   - Name, Contact Person
   - Email, Phone, Address
4. Click "Save Supplier"

**Usage:**

- Assign suppliers to products
- Track purchase history
- Analyze supplier performance

### 📊 Generating Reports

**Available Reports:**

1. **Monthly Report**: Sales and profit overview
2. **P&L Report**: Profit and Loss with date range
3. **Inventory Valuation**: Current inventory worth
4. **Sales Trends**: Historical sales analysis

**Accessing Reports:**

- Use navigation buttons for different reports
- Select date ranges where applicable
- Print or export reports as needed

## 🔐 User Management

### Default Accounts

The system comes with a default admin account:

- **Username**: `admin`
- **Email**: `admin@inventory.com`
- **Password**: `admin123`
- **Role**: `admin`

### Adding New Users

Currently, new users can be added directly to the database or through the registration endpoint:

```sql
INSERT INTO users (username, email, password, role)
VALUES ('manager', 'manager@company.com', 'hashed_password', 'user');
```

## 🔌 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| POST   | `/auth/register` | Register new user |
| POST   | `/auth/login`    | User login        |
| GET    | `/auth/profile`  | Get user profile  |

### Products Endpoints

| Method | Endpoint                   | Description            |
| ------ | -------------------------- | ---------------------- |
| GET    | `/products`                | Get all products       |
| GET    | `/products/:id`            | Get product by ID      |
| POST   | `/products`                | Create new product     |
| PUT    | `/products/:id`            | Update product         |
| DELETE | `/products/:id`            | Delete product         |
| GET    | `/products/low-stock`      | Get low stock products |
| GET    | `/products/search?q=query` | Search products        |

### Sales Endpoints

| Method | Endpoint | Description     |
| ------ | -------- | --------------- |
| GET    | `/sales` | Get all sales   |
| POST   | `/sales` | Create new sale |

### Reports Endpoints

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/reports/monthly`             | Monthly sales report |
| GET    | `/reports/profit-loss`         | P&L report           |
| GET    | `/reports/inventory-valuation` | Inventory valuation  |

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**

```bash
# Check if Docker is running
docker ps

# Restart database container
docker-compose restart

# Check logs
docker logs inventory-mysql
```

**2. Port Already in Use**

```bash
# Change port in .env file
PORT=3001

# Or kill process using port
npx kill-port 3000
```

**3. Module Not Found Errors**

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

**4. Frontend Not Loading**

- Ensure you're running a web server in the frontend directory
- Check browser console for errors
- Verify backend is running on port 3000

### Logs and Debugging

**Backend Logs:**

- Check terminal where `npm run dev` is running
- Look for database connection messages
- Monitor API request logs

**Frontend Debugging:**

- Open browser Developer Tools (F12)
- Check Console tab for JavaScript errors
- Monitor Network tab for API calls

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)

```bash
# Set environment variables in deployment platform
DB_HOST=your-mysql-host
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
JWT_SECRET=your-production-secret
```

### Frontend Deployment (Netlify/Vercel)

1. Build the frontend (if needed)
2. Deploy the `frontend` folder
3. Update API base URL in production

### Database Deployment

**Option 1: Cloud MySQL**

- AWS RDS
- Google Cloud SQL
- PlanetScale

**Option 2: Docker in Production**

```yaml
# Update docker-compose.prod.yml
version: "3.8"
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: strong-production-password
    volumes:
      - mysql_data:/var/lib/mysql
    restart: always
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use consistent indentation (2 spaces)
- Follow JavaScript best practices
- Comment complex logic
- Validate inputs and handle errors
- Test all features before submitting

## 📞 Support

If you encounter issues or have questions:

1. **Check the troubleshooting section**
2. **Review the API documentation**
3. **Examine browser console errors**
4. **Check backend server logs**

### Getting Help

- Create an issue in the repository
- Provide detailed error messages
- Include steps to reproduce the problem
- Share relevant log files

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎉 Acknowledgments

- Built with modern web technologies
- Designed for ease of use and scalability
- Comprehensive documentation
- Regular updates and improvements

---
