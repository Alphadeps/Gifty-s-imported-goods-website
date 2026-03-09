// This script is meant to be run once to initialize the tables
const { readFileSync } = require('fs');
const path = require('path');
const pool = require('../index');

async function runMigrations() {
    console.log('Starting migrations...');
    const client = await pool.connect();

    try {
        const sqlPath = path.join(__dirname, '01_create_admin_table.sql');
        const sql = readFileSync(sqlPath, 'utf8');

        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');

        console.log('Migration 01_create_admin_table.sql completed successfully.');
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
