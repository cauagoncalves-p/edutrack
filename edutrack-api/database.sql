-- Criação do banco de dados
CREATE DATABASE EduTrackDB;
GO

USE EduTrackDB;
GO

-- Tabela de usuários
CREATE TABLE users (
    id INT IDENTITY(1,1) NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),
	CONSTRAINT PK_users PRIMARY KEY(id)
);
GO

-- Tabela de disciplinas
CREATE TABLE subjects (
    id INT IDENTITY(1,1) NOT NULL,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    teacher VARCHAR(150) NULL,
    workload_hours INT NULL,
    description VARCHAR(MAX) NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    created_at DATETIME DEFAULT GETDATE(),
	CONSTRAINT PK_subject PRIMARY KEY(id),
    CONSTRAINT FK_subjects_users FOREIGN KEY (user_id) REFERENCES users(id)
);
GO

-- Tabela de tarefas
CREATE TABLE academic_tasks (
    id INT IDENTITY(1,1) NOT NULL,
    subject_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(MAX) NULL,
    due_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),
	CONSTRAINT PK_academic_tasks PRIMARY KEY(id),
    CONSTRAINT FK_academic_tasks_subjects FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT CK_academic_tasks_status CHECK (status IN ('pending', 'in_progress', 'completed'))
);
GO