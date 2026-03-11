require('dotenv').config();
const { Pool } = require('pg');

// Use Neon Database Connection String
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
