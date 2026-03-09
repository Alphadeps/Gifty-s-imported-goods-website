CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    current_price INT NOT NULL,
    available BOOL DEFAULT true,
    new_price INT,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    quantity INT DEFAULT 0,
    image_urls VARCHAR[] DEFAULT '{}',
    attributes JSONB DEFAULT '{}'::jsonb,
    deleted_at TIMESTAMP NULL
);
