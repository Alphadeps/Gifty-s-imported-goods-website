const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../api/.env') });
const crypto = require('crypto');

// Generate UUID for testing locally since DB migrator might not have extension enabled automatically
const uuid = () => crypto.randomUUID();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const categories = [
    { id: uuid(), name: 'Personal' }, // Replaces Grooming / Personal Care & Grooming
    { id: uuid(), name: 'Household' },          // Replaces Home / Home Essentials
    { id: uuid(), name: 'Bottles' },    // Replaces Drinkware / Drinkware & Hydration
    { id: uuid(), name: 'Grocery' },         // Replaces Pantry / Pantry & Gourmet
    { id: uuid(), name: 'Health' },        // Replaces Wellness / Health & Wellness
    { id: uuid(), name: 'Shower' },              // Replaces Bath / Bath & Body
    { id: uuid(), name: 'Skincare' },                 // Replaces Skincare
    { id: uuid(), name: 'Bags' }      // Replaces Accessories / Travel & Accessories
];

const findCatId = (nameMatch) => categories.find(c => c.name.includes(nameMatch)).id;

const products = [
    // --- 3 FEATURED PREMIUM PRODUCTS (Landing Page) ---
    { name: 'Vital Proteins Collagen Peptides', price: 55000, cat: 'Health', img: '/images/food bags and supplement/vital proteins collagen peptides.png', featured: true },
    { name: 'Royal Brown Basmati Rice (Premium)', price: 45000, cat: 'Grocery', img: '/images/food/royal brown basmati rice.png', featured: true },
    { name: 'Ello Port Premium Bottle (Purple)', price: 21000, cat: 'Bottles', img: '/images/ello port bottle/purple ello port bottle.png', featured: true },

    // --- STANDARD CATALOG ---
    // Personal Care & Grooming
    { name: 'Gillette Ultimate Protection', price: 12500, cat: 'Personal', img: '/images/deodorant and antiperspirant/gillette ultimate protection.png', featured: false },
    { name: 'Degree Antiperspirant 1', price: 8500, cat: 'Personal', img: '/images/deodorant and antiperspirant/degree antiperspirant.png', featured: false },
    { name: 'Degree Antiperspirant 2', price: 8500, cat: 'Personal', img: '/images/deodorant and antiperspirant/degree antiperspirant (2).png', featured: false },
    { name: 'Dove Advanced Care Invisible+', price: 9500, cat: 'Personal', img: '/images/deodorant and antiperspirant/dove advanced care invisible+.png', featured: false },
    { name: 'Dove Men+Care Antiperspirant', price: 9000, cat: 'Personal', img: '/images/deodorant and antiperspirant/dove men+care antiperspirant.png', featured: false },
    { name: 'Outlast Deodorant', price: 8000, cat: 'Personal', img: '/images/deodorant and antiperspirant/outlast deodorant.png', featured: false },
    { name: 'Secret Deodorant', price: 8500, cat: 'Personal', img: '/images/deodorant and antiperspirant/secret deodorant.png', featured: false },

    // Home Essentials
    { name: 'Kirkland Ultra Shine Detergent', price: 32000, cat: 'Household', img: '/images/detergent and air freshener/kirkland ultra shine.png', featured: false },
    { name: 'Febreze Air', price: 11000, cat: 'Household', img: '/images/detergent and air freshener/febreze air.png', featured: false },
    { name: 'Febreze Classic', price: 10500, cat: 'Household', img: '/images/detergent and air freshener/febreze.png', featured: false },
    { name: 'Palmolive Dish Soap', price: 7500, cat: 'Household', img: '/images/detergent and air freshener/palmolive.png', featured: false },

    // Drinkware & Hydration
    { name: 'Ello Port Bottle (Standard)', price: 21000, cat: 'Bottles', img: '/images/ello port bottle/ello port.png', featured: false },
    { name: 'Ello Port Bottle (White)', price: 21000, cat: 'Bottles', img: '/images/ello port bottle/whitw ello port bottle.png', featured: false },

    // Pantry & Gourmet
    { name: 'Jasmine Rice', price: 38000, cat: 'Grocery', img: '/images/food/jasmine rice.png', featured: false },
    { name: 'Kirkland Cooking Oil', price: 26000, cat: 'Grocery', img: '/images/food/kirkland oil.png', featured: false },

    // Health & Wellness
    { name: 'Vital Proteins (Less Plastic)', price: 54000, cat: 'Health', img: '/images/food bags and supplement/80% less plastic vital proteins collagen peptides.png', featured: false },
    { name: 'Kirkland Freezer Bags', price: 14000, cat: 'Household', img: '/images/food bags and supplement/kirkland freezer.png', featured: false }, // Moved from supplement to essentials

    // Bath & Body
    { name: 'Dove Body Wash', price: 13000, cat: 'Shower', img: '/images/shampoo and body+face wash/dove body wash.png', featured: false },
    { name: 'Dove Deep Moisture', price: 13500, cat: 'Shower', img: '/images/shampoo and body+face wash/dove deep moisture.jpg', featured: false },
    { name: 'Dove Men+Care Wash', price: 13000, cat: 'Shower', img: '/images/shampoo and body+face wash/dove men+care body+face wash.png', featured: false },
    { name: 'Dove Sensitive Body Wash', price: 14000, cat: 'Shower', img: '/images/shampoo and body+face wash/dove sensitive skin body wash.png', featured: false },
    { name: 'Irish Spring Body Wash', price: 11000, cat: 'Shower', img: '/images/shampoo and body+face wash/irish spring body wash.png', featured: false },
    { name: 'Irish Spring Twin Body Wash', price: 20000, cat: 'Shower', img: '/images/shampoo and body+face wash/irish spring twin wash.png', featured: false },
    { name: 'Dove Pink Beauty Bar', price: 4500, cat: 'Shower', img: '/images/soap bar/dove pink beauty bar.png', featured: false },
    { name: 'Dove Sensitive Skin Soap', price: 4500, cat: 'Shower', img: '/images/soap bar/dove sensitive skin soap bar.png', featured: false },
    { name: 'Dove Shea Butter Soap', price: 4800, cat: 'Shower', img: '/images/soap bar/dove shea butter soap bar.png', featured: false },
    { name: 'Irish Spring Soap Bar', price: 3000, cat: 'Shower', img: '/images/soap bar/irish spring.png', featured: false },
    { name: 'Olay Soap Bar', price: 5000, cat: 'Shower', img: '/images/soap bar/olay soap.png', featured: false },

    // Skincare
    { name: 'Cetaphil Gentle Skin Cleanser', price: 18000, cat: 'Skincare', img: '/images/skin cleanser and moisturizer/cetaphil gentle skin cleanser.png', featured: false },
    { name: 'Cetaphil Moisturizing Cream', price: 21000, cat: 'Skincare', img: '/images/skin cleanser and moisturizer/cetaphil moisturizing cream.png', featured: false },
    { name: 'Cetaphil Skin Cleanser', price: 18500, cat: 'Skincare', img: '/images/skin cleanser and moisturizer/cetaphil skin cleanser.png', featured: false },
    { name: 'Makeup Remover', price: 9000, cat: 'Skincare', img: '/images/skin cleanser and moisturizer/makeup remover.png', featured: false },

    // Travel & Accessories
    { name: 'Members Mark Tote Bag', price: 12000, cat: 'Bags', img: '/images/tote bag or lunch box/member\'s mark tote bag.png', featured: false },
    { name: 'Pink Members Mark Tote Bag', price: 12000, cat: 'Bags', img: '/images/tote bag or lunch box/pink member\'s mark tote bag.png', featured: false },
    { name: 'Striped Members Mark Tote Bag', price: 12000, cat: 'Bags', img: '/images/tote bag or lunch box/stripes memeber\'s mark tote bag.png', featured: false },
    { name: 'Veronica Hampton Lunch Box', price: 16000, cat: 'Bags', img: '/images/tote bag or lunch box/veronica hampton lunch box.png', featured: false },
];

async function seed() {
    console.log("Starting DB Seeder...");

    try {
        // 1. ADD NEW SCHEMA COLUMN (is_featured) + image_urls if not exists
        console.log("Updating Schema...");
        await pool.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
            
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;

            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
        `);
        console.log("Schema Updated!");

        // 2. CLEAR EXISTING DATA (For fresh start during dev)
        console.log("Clearing tables...");
        await pool.query(`TRUNCATE TABLE products CASCADE`);
        await pool.query(`TRUNCATE TABLE categories CASCADE`);

        // 3. SEED CATEGORIES
        console.log("Seeding Categories...");
        for (const cat of categories) {
            const slug = generateSlug(cat.name);
            await pool.query(
                `INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3)`,
                [cat.id, cat.name, slug]
            );
        }

        // 4. SEED PRODUCTS
        console.log("Seeding Products...");
        for (const p of products) {
            const catId = findCatId(p.cat);
            const slug = generateSlug(p.name);
            const pgArraySyntax = `{${p.img}}`; // Native Postgres 1D array literal

            await pool.query(`
                INSERT INTO products 
                (id, name, slug, current_price, available, description, category_id, image_urls, is_featured, quantity) 
                VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8, 50)
            `, [uuid(), p.name, slug, p.price, 'Premium quality imported item.', catId, pgArraySyntax, p.featured]);
        }

        console.log("✅ Seed complete! Successfully added", categories.length, "categories and", products.length, "products.");

    } catch (err) {
        console.error("Seeding failed: ", err);
    } finally {
        pool.end();
    }
}

seed();
