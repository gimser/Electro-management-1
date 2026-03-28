
-- جداول النظام الأساسية المحدثة لبيئة Cloudflare D1

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'Owner',
    password_hash TEXT
);

CREATE TABLE IF NOT EXISTS social_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE,
    sender_name TEXT,
    sender_phone TEXT,
    content TEXT,
    source TEXT, -- 'WhatsApp', 'Facebook', 'Instagram'
    status TEXT DEFAULT 'New', -- 'New', 'Converted', 'Archived'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT,
    phone TEXT,
    interest TEXT,
    source TEXT,
    status TEXT DEFAULT 'New',
    conversion_probability INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS automation_rules (
    id TEXT PRIMARY KEY,
    trigger_event TEXT,
    action_type TEXT,
    template TEXT,
    is_active BOOLEAN DEFAULT 1
);
