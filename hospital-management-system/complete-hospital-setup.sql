-- Complete Hospital Management System Database Setup
CREATE DATABASE IF NOT EXISTS hospital_db;
USE hospital_db;

-- ==================== PHASE 1 TABLES ====================

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

-- ==================== PHASE 2 TABLES ====================

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

-- Prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_name VARCHAR(100) NOT NULL,
    diagnosis TEXT,
    prescription_date DATE NOT NULL,
    status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Prescription items table
CREATE TABLE IF NOT EXISTS prescription_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prescription_id INT NOT NULL,
    drug_id INT NOT NULL,
    quantity INT NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE
);

-- Billing tables
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    balance_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status ENUM('Pending', 'Partial', 'Paid', 'Overdue') DEFAULT 'Pending',
    payment_method VARCHAR(50),
    insurance_provider VARCHAR(100),
    insurance_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bill_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    item_type ENUM('Consultation', 'Procedure', 'Medication', 'LabTest', 'Room', 'Other') NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

-- ==================== SAMPLE DATA ====================

-- Sample patients
INSERT INTO patients (patient_id, first_name, last_name, email, phone, date_of_birth, gender, address) VALUES
('PAT001', 'John', 'Doe', 'john.doe@email.com', '+1234567890', '1985-05-15', 'Male', '123 Main St, City, State'),
('PAT002', 'Jane', 'Smith', 'jane.smith@email.com', '+1234567891', '1990-08-22', 'Female', '456 Oak Ave, City, State'),
('PAT003', 'Mike', 'Johnson', 'mike.johnson@email.com', '+1234567892', '1978-12-10', 'Male', '789 Pine Rd, City, State');

-- Sample appointments
INSERT INTO appointments (appointment_id, patient_id, doctor_name, appointment_date, appointment_time, appointment_type, status, reason) VALUES
('APT001', 1, 'Dr. Sarah Wilson', CURDATE(), '10:00:00', 'Consultation', 'Scheduled', 'Regular checkup'),
('APT002', 2, 'Dr. Mike Johnson', CURDATE(), '14:30:00', 'Checkup', 'Scheduled', 'Follow-up visit'),
('APT003', 3, 'Dr. Emily Chen', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:15:00', 'Consultation', 'Scheduled', 'New patient consultation');

-- Sample drugs
INSERT INTO drugs (drug_id, name, brand, category, description, unit_price, stock_quantity, reorder_level, expiry_date, supplier) VALUES
('DRG001', 'Paracetamol', 'Panadol', 'Analgesic', 'Pain and fever relief', 5.50, 100, 20, '2025-12-31', 'Pharma Corp'),
('DRG002', 'Amoxicillin', 'Amoxil', 'Antibiotic', 'Broad spectrum antibiotic', 12.75, 50, 15, '2025-06-30', 'Medi Supplies'),
('DRG003', 'Metformin', 'Glucophage', 'Antidiabetic', 'Type 2 diabetes treatment', 8.25, 75, 25, '2026-03-31', 'Health Pharma'),
('DRG004', 'Atorvastatin', 'Lipitor', 'Cholesterol', 'Cholesterol management', 15.30, 30, 10, '2025-09-30', 'Cardio Meds'),
('DRG005', 'Ibuprofen', 'Advil', 'Analgesic', 'Anti-inflammatory pain relief', 7.80, 60, 15, '2025-11-30', 'Pharma Corp');

-- Sample lab tests
INSERT INTO lab_tests (test_id, test_name, description, category, price, turnaround_time, normal_range) VALUES
('LAB001', 'Complete Blood Count', 'Measures different components of blood', 'Hematology', 25.00, '24 hours', 'Varies by component'),
('LAB002', 'Blood Glucose', 'Measures blood sugar levels', 'Biochemistry', 15.50, '4 hours', '70-100 mg/dL'),
('LAB003', 'Lipid Profile', 'Cholesterol and triglycerides', 'Biochemistry', 35.00, '24 hours', 'LDL < 100 mg/dL'),
('LAB004', 'Liver Function Test', 'Liver enzyme levels', 'Biochemistry', 40.00, '24 hours', 'AST: 10-40 U/L'),
('LAB005', 'Thyroid Function Test', 'Thyroid hormone levels', 'Endocrinology', 45.00, '48 hours', 'TSH: 0.4-4.0 mIU/L');

-- Sample bills
INSERT INTO bills (bill_id, patient_id, bill_date, due_date, total_amount, paid_amount, balance_amount, status, insurance_provider) VALUES
('BL001', 1, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 150.00, 150.00, 0.00, 'Paid', 'HealthCare Inc'),
('BL002', 2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 75.50, 50.00, 25.50, 'Partial', 'MediCover');