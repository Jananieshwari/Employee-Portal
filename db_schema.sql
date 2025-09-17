-- Create database and tables (run inside MySQL Workbench)
CREATE DATABASE IF NOT EXISTS iconic_onboarding CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE iconic_onboarding;

-- Admins
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users (access requests)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personal details
CREATE TABLE IF NOT EXISTS personal_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  department VARCHAR(255),
  college VARCHAR(255),
  state VARCHAR(255),
  pincode VARCHAR(20),
  nationality VARCHAR(100),
  blood_group VARCHAR(10),
  mother_name VARCHAR(255),
  father_name VARCHAR(255),
  tenth_percentage VARCHAR(20),
  twelfth_percentage VARCHAR(20),
  pg_percentage VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  filename VARCHAR(512),
  original_filename VARCHAR(512),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
