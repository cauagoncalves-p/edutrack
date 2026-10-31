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

CREATE TABLE tutor_messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    conversation_id INT NOT NULL
        FOREIGN KEY REFERENCES tutor_conversations(id) ON DELETE CASCADE,
    role VARCHAR(10) NOT NULL CHECK (role IN ('user','assistant')),
    content NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);