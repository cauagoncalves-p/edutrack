CREATE DATABASE EduTrackDB;
GO

USE EduTrackDB;
GO

CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE subjects (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    teacher VARCHAR(150) NULL,
    workload_hours INT NULL,
    description VARCHAR(MAX) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_subjects_users FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

CREATE TABLE academic_tasks (
    id INT IDENTITY(1,1) PRIMARY KEY,
    subject_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(MAX) NULL,
    due_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_academic_tasks_subjects FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT CK_academic_tasks_status CHECK (status IN ('pending', 'in_progress', 'completed'))
);
GO

CREATE TABLE tutor_conversations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    subject_id INT NULL FOREIGN KEY REFERENCES subjects(id) ON DELETE SET NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'teacher'
        CHECK (mode IN ('teacher','exercises','review','socratic')),
    title NVARCHAR(150) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE tutor_messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    conversation_id INT NOT NULL
        FOREIGN KEY REFERENCES tutor_conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user','assistant')),
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- Login usado pela API (troque a senha)
CREATE LOGIN edutrack_api WITH PASSWORD = 'Outra_Senha_Forte_456', CHECK_POLICY = ON, CHECK_EXPIRATION = OFF;
GO

CREATE USER edutrack_api FOR LOGIN edutrack_api;
ALTER ROLE db_owner ADD MEMBER edutrack_api;
GO
