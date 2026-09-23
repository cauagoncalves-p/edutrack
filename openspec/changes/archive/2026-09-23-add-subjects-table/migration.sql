CREATE TABLE subjects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    name VARCHAR(150) NOT NULL,
    teacher VARCHAR(150) NULL,
    workload_hours INT NULL,
    description VARCHAR(MAX) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    created_at DATETIME DEFAULT GETDATE()
);