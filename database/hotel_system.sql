-- Drop tables in correct order (to handle foreign key constraints)
DROP TABLE IF EXISTS maintenance_requests;
DROP TABLE IF EXISTS housekeeping_tasks;
DROP TABLE IF EXISTS housekeeping_staff;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'receptionist') DEFAULT 'receptionist',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create rooms table
CREATE TABLE rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create guests table
CREATE TABLE guests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    id_proof VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    guest_id INT,
    room_id INT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_amount DECIMAL(10,2),
    status ENUM('confirmed', 'checked-in', 'checked-out', 'cancelled') DEFAULT 'confirmed',
    payment_status ENUM('pending', 'paid', 'partial', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Create payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'transfer') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Create housekeeping_staff table
CREATE TABLE housekeeping_staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    section VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create housekeeping_tasks table
CREATE TABLE housekeeping_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT,
    assigned_to INT,
    task_type ENUM('cleaning', 'maintenance', 'inspection') DEFAULT 'cleaning',
    status ENUM('pending', 'in-progress', 'completed', 'verified') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES housekeeping_staff(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create maintenance_requests table
CREATE TABLE maintenance_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT,
    reported_by INT,
    issue_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('reported', 'assigned', 'in-progress', 'completed', 'verified') DEFAULT 'reported',
    assigned_to INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES housekeeping_staff(id) ON DELETE SET NULL
);

-- Insert sample data

-- Users (password for all: 'password123')
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@hotel.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('manager', 'manager@hotel.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager'),
('receptionist', 'reception@hotel.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'receptionist'),
('housekeeper1', 'clean1@hotel.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'receptionist'),
('housekeeper2', 'clean2@hotel.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'receptionist');

-- Rooms
INSERT INTO rooms (room_number, room_type, price_per_night, description) VALUES
('101', 'Standard', 100.00, 'Standard room with single bed, AC, and bathroom'),
('102', 'Standard', 100.00, 'Standard room with single bed, AC, and bathroom'),
('201', 'Deluxe', 150.00, 'Deluxe room with double bed, AC, mini-fridge, and bathroom'),
('202', 'Deluxe', 150.00, 'Deluxe room with double bed, AC, mini-fridge, and bathroom'),
('301', 'Suite', 250.00, 'Luxury suite with living area, king bed, and premium amenities'),
('302', 'Suite', 250.00, 'Luxury suite with living area, king bed, and premium amenities');

-- Guests
INSERT INTO guests (first_name, last_name, email, phone) VALUES
('John', 'Doe', 'john@email.com', '123-456-7890'),
('Jane', 'Smith', 'jane@email.com', '123-456-7891'),
('Mike', 'Johnson', 'mike@email.com', '123-456-7892'),
('Sarah', 'Wilson', 'sarah@email.com', '123-456-7893');

-- Bookings
INSERT INTO bookings (guest_id, room_id, check_in, check_out, total_amount, status) VALUES
(1, 1, '2024-01-15', '2024-01-17', 200.00, 'checked-out'),
(2, 3, '2024-01-16', '2024-01-18', 300.00, 'checked-in'),
(3, 2, '2024-01-18', '2024-01-20', 200.00, 'confirmed');

-- Housekeeping staff
INSERT INTO housekeeping_staff (user_id, section) VALUES
(4, 'Floor-1'),  -- housekeeper1
(5, 'Floor-2');  -- housekeeper2

-- Housekeeping tasks
INSERT INTO housekeeping_tasks (room_id, assigned_to, task_type, status, priority, notes, created_by) VALUES
(1, 1, 'cleaning', 'completed', 'medium', 'Regular cleaning after guest checkout', 1),
(2, 2, 'cleaning', 'in-progress', 'high', 'VIP guest arriving soon', 1),
(3, 1, 'maintenance', 'pending', 'medium', 'Check AC unit', 2),
(4, 2, 'inspection', 'pending', 'low', 'Monthly room inspection', 1);

-- Maintenance requests
INSERT INTO maintenance_requests (room_id, reported_by, issue_type, description, priority, status, assigned_to) VALUES
(1, 1, 'Plumbing', 'Bathroom sink draining slowly', 'medium', 'reported', NULL),
(3, 2, 'Electrical', 'AC unit not cooling properly', 'high', 'assigned', 1),
(5, 1, 'Furniture', 'Desk drawer stuck', 'low', 'completed', 2);

-- Payments
INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_id) VALUES
(1, 200.00, 'card', 'completed', 'TXN001'),
(2, 150.00, 'cash', 'completed', 'TXN002'),
(3, 100.00, 'transfer', 'completed', 'TXN003');