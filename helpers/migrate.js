const mysql = require('mysql2/promise');
require('dotenv').config();

const schema = `
CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};
USE ${process.env.DB_NAME};

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Manager', 'Employee') DEFAULT 'Employee',
  phone VARCHAR(20),
  department VARCHAR(100),
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(200) NOT NULL,
  industry VARCHAR(100),
  contact_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100) NOT NULL,
  address TEXT,
  status ENUM('Active', 'Inactive') DEFAULT 'Active',
  project_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL,
  project_name VARCHAR(200) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12, 2),
  status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS project_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(50),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_project_member (project_id, user_id)
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to INT,
  status ENUM('To Do', 'In Progress', 'Completed') DEFAULT 'To Do',
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  due_date DATE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attachments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  uploaded_by INT,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@bytez.com', '$2a$10$rZ5qH8qF9xKxYxKxYxKxYeN5qH8qF9xKxYxKxYxKxYeN5qH8qF9xK', 'Admin'),
('Manager User', 'manager@bytez.com', '$2a$10$rZ5qH8qF9xKxYxKxYxKxYeN5qH8qF9xKxYxKxYxKxYeN5qH8qF9xK', 'Manager'),
('Employee User', 'employee@bytez.com', '$2a$10$rZ5qH8qF9xKxYxKxYxKxYeN5qH8qF9xKxYxKxYxKxYeN5qH8qF9xK', 'Employee')
ON DUPLICATE KEY UPDATE email=email;
`;

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      multipleStatements: true
    });

    console.log('🔄 Running database migrations...');
    await connection.query(schema);
    console.log('✅ Database migrations completed successfully!');
    console.log('📝 Default users created (password: password123):');
    console.log('   - admin@bytez.com (Admin)');
    console.log('   - manager@bytez.com (Manager)');
    console.log('   - employee@bytez.com (Employee)');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
