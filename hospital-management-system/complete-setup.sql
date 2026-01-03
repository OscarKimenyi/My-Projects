-- Complete Hospital Management System Schema
CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    insurance_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    appointment_type ENUM('Consultation', 'Checkup', 'Follow-up', 'Emergency'),
    status ENUM('Scheduled', 'Completed', 'Cancelled', 'No-show') DEFAULT 'Scheduled',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Drugs table
CREATE TABLE IF NOT EXISTS drugs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drug_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    unit_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 10,
    expiry_date DATE,
    supplier VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Lab tests table
CREATE TABLE IF NOT EXISTS lab_tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id VARCHAR(20) UNIQUE NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    turnaround_time VARCHAR(50),
    normal_range TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO patients (patient_id, first_name, last_name, email, phone, date_of_birth, gender, address) VALUES
('PAT001', 'John', 'Doe', 'john.doe@email.com', '+1234567890', '1985-05-15', 'Male', '123 Main St, City, State'),
('PAT002', 'Jane', 'Smith', 'jane.smith@email.com', '+1234567891', '1990-08-22', 'Female', '456 Oak Ave, City, State');

INSERT INTO appointments (appointment_id, patient_id, doctor_name, appointment_date, appointment_time, appointment_type, status, reason) VALUES
('APT001', 1, 'Dr. Sarah Wilson', '2024-01-15', '10:00:00', 'Consultation', 'Completed', 'Regular checkup'),
('APT002', 2, 'Dr. Mike Johnson', '2024-01-20', '14:30:00', 'Checkup', 'Scheduled', 'Follow-up visit');

INSERT INTO drugs (drug_id, name, brand, category, description, unit_price, stock_quantity, reorder_level, expiry_date, supplier) VALUES
('DRG001', 'Paracetamol', 'Panadol', 'Analgesic', 'Pain and fever relief', 5.50, 100, 20, '2025-12-31', 'Pharma Corp'),
('DRG002', 'Amoxicillin', 'Amoxil', 'Antibiotic', 'Broad spectrum antibiotic', 12.75, 50, 15, '2025-06-30', 'Medi Supplies'),
('DRG003', 'Metformin', 'Glucophage', 'Antidiabetic', 'Type 2 diabetes treatment', 8.25, 75, 25, '2026-03-31', 'Health Pharma'),
('DRG004', 'Atorvastatin', 'Lipitor', 'Cholesterol', 'Cholesterol management', 15.30, 30, 10, '2025-09-30', 'Cardio Meds');

INSERT INTO lab_tests (test_id, test_name, description, category, price, turnaround_time, normal_range) VALUES
('LAB001', 'Complete Blood Count', 'Measures different components of blood', 'Hematology', 25.00, '24 hours', 'Varies by component'),
('LAB002', 'Blood Glucose', 'Measures blood sugar levels', 'Biochemistry', 15.50, '4 hours', '70-100 mg/dL'),
('LAB003', 'Lipid Profile', 'Cholesterol and triglycerides', 'Biochemistry', 35.00, '24 hours', 'LDL < 100 mg/dL'),
('LAB004', 'Liver Function Test', 'Liver enzyme levels', 'Biochemistry', 40.00, '24 hours', 'AST: 10-40 U/L');