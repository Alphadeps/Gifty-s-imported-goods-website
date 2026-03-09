// This script is meant to be run once to initialize the tables
const { readFileSync } = require('fs');
const path = require('path');
const pool = require('../index');

async function runMigrations() {
    console.log('Starting migrations...');
    const client = await pool.connect();

    try {
        const sqlPath1 = path.join(__dirname, '01_create_admin_table.sql');
        const sql1 = readFileSync(sqlPath1, 'utf8');

        const sqlPath2 = path.join(__dirname, '02_create_categories_table.sql');
        const sql2 = readFileSync(sqlPath2, 'utf8');

        const sqlPath3 = path.join(__dirname, '03_create_products_table.sql');
        const sql3 = readFileSync(sqlPath3, 'utf8');

        const sqlPath4 = path.join(__dirname, '04_create_inquiries_table.sql');
        const sql4 = readFileSync(sqlPath4, 'utf8');

        const sqlPath5 = path.join(__dirname, '05_alter_products_add_blurhash.sql');
        const sql5 = readFileSync(sqlPath5, 'utf8');

        await client.query('BEGIN');
        await client.query(sql1);
        console.log('Migration 01_create_admin_table.sql completed successfully.');

        await client.query(sql2);
        console.log('Migration 02_create_categories_table.sql completed successfully.');

        await client.query(sql3);
        console.log('Migration 03_create_products_table.sql completed successfully.');

        await client.query(sql4);
        console.log('Migration 04_create_inquiries_table.sql completed successfully.');

        await client.query(sql5);
        console.log('Migration 05_alter_products_add_blurhash.sql completed successfully.');

        await client.query('COMMIT');

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
