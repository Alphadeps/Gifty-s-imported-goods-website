const { readFileSync, readdirSync } = require('fs');
require('dotenv').config();
const path = require('path');
const pool = require('../index');

async function runMigrations() {
    console.log('Starting migrations...');
    if (!process.env.DATABASE_URL) {
        console.error('ERROR: DATABASE_URL is not defined in environment.');
        process.exit(1);
    }
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL.substring(0, 20) + '...');
    
    let client;
    try {
        client = await pool.connect();
        console.log('Successfully connected to the database.');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }

    try {
        const migrationsDir = __dirname;
        const migrationFiles = readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Sort to ensure sequence (01, 02, 03...)

        await client.query('BEGIN');
        
        for (const file of migrationFiles) {
            const sqlPath = path.join(migrationsDir, file);
            const sql = readFileSync(sqlPath, 'utf8');
            
            console.log(`Running migration: ${file}...`);
            try {
                await client.query(sql);
                console.log(`Migration ${file} completed successfully.`);
            } catch (err) {
                console.error(`Error in migration ${file}:`, err.message);
                throw err;
            }
        }

        await client.query('COMMIT');
        console.log('All migrations completed successfully.');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
        throw e;
    } finally {
        client.release();
    }
}

// Allow running this script from command line: node src/db/migrations/run.js
if (require.main === module) {
    runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = runMigrations;
