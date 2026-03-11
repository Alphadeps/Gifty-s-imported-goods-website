const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const crypto = require('crypto');

// Generate UUID for testing
const uuid = () => crypto.randomUUID();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

const categories = [
    { id: uuid(), name: 'Personal' },
    { id: uuid(), name: 'Household' },
    { id: uuid(), name: 'Bottles' },
    { id: uuid(), name: 'Grocery' },
    { id: uuid(), name: 'Health' },
    { id: uuid(), name: 'Shower' },
    { id: uuid(), name: 'Skincare' },
    { id: uuid(), name: 'Bags' }
];

const findCatId = (nameMatch) => categories.find(c => c.name.includes(nameMatch)).id;

const products = [
  {
    "name": "Royal Brown Basmati Rice (Premium)",
    "price": 45000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/food/royal%20brown%20basmati%20rice.png",
    "featured": true,
    "cat": "Grocery"
  },
  {
    "name": "Ello Port Premium Bottle (Purple)",
    "price": 21000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/ello%20port%20bottle/purple%20ello%20port%20bottle.png",
    "featured": true,
    "cat": "Bottles"
  },
  {
    "name": "Gillette Ultimate Protection",
    "price": 12500,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/deodorant%20and%20antiperspirant/gillette%20ultimate%20protection.png",
    "featured": false,
    "cat": "Personal"
  },
  {
    "name": "Degree Antiperspirant 1",
    "price": 8500,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/deodorant%20and%20antiperspirant/degree%20antiperspirant.png",
    "featured": false,
    "cat": "Personal"
  },
  {
    "name": "Dove Advanced Care Invisible+",
    "price": 9500,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/deodorant%20and%20antiperspirant/dove%20advanced%20care%20invisible+.png",
    "featured": false,
    "cat": "Personal"
  },
  {
    "name": "Dove Men+Care Antiperspirant",
    "price": 9000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/deodorant%20and%20antiperspirant/dove%20men+care%20antiperspirant.png",
    "featured": false,
    "cat": "Personal"
  },
  {
    "name": "Outlast Deodorant",
    "price": 8000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/deodorant%20and%20antiperspirant/outlast%20deodorant.png",
    "featured": false,
    "cat": "Personal"
  },
  {
    "name": "Kirkland Ultra Shine Detergent",
    "price": 32000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/detergent%20and%20air%20freshener/kirkland%20ultra%20shine.png",
    "featured": false,
    "cat": "Household"
  },
  {
    "name": "Febreze Air",
    "price": 11000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/detergent%20and%20air%20freshener/febreze%20air.png",
    "featured": false,
    "cat": "Household"
  },
  {
    "name": "Febreze Classic",
    "price": 10500,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/detergent%20and%20air%20freshener/febreze.png",
    "featured": false,
    "cat": "Household"
  },
  {
    "name": "Ello Port Bottle (Standard)",
    "price": 21000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/ello%20port%20bottle/ello%20port.png",
    "featured": false,
    "cat": "Bottles"
  },
  {
    "name": "Ello Port Bottle (White)",
    "price": 21000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/ello%20port%20bottle/whitw%20ello%20port%20bottle.png",
    "featured": false,
    "cat": "Bottles"
  },
  {
    "name": "Kirkland Cooking Oil",
    "price": 26000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/food/kirkland%20oil.png",
    "featured": false,
    "cat": "Grocery"
  },
  {
    "name": "Kirkland Freezer Bags",
    "price": 14000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/food%20bags%20and%20supplement/kirkland%20freezer.png",
    "featured": false,
    "cat": "Household"
  },
  {
    "name": "Dove Deep Moisture",
    "price": 13500,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/shampoo%20and%20body+face%20wash/dove%20deep%20moisture.jpg",
    "featured": false,
    "cat": "Shower"
  },
  {
    "name": "Dove Men+Care Wash",
    "price": 13000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/deodorant%20and%20antiperspirant/dove%20advanced%20care%20invisible+.png",
    "featured": false,
    "cat": "Shower"
  },
  {
    "name": "Dove Sensitive Body Wash",
    "price": 14000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/shampoo%20and%20body+face%20wash/dove%20sensitive%20skin%20body%20wash.png",
    "featured": false,
    "cat": "Shower"
  },
  {
    "name": "Irish Spring Twin Body Wash",
    "price": 20000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/shampoo%20and%20body+face%20wash/irish%20spring%20body%20wash.png",
    "featured": false,
    "cat": "Shower"
  },
  {
    "name": "Dove Pink Beauty Bar",
    "price": 4500,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/soap%20bar/dove%20pink%20beauty%20bar.png",
    "featured": false,
    "cat": "Shower"
  },
  {
    "name": "Dove Sensitive Skin Soap",
    "price": 4500,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/soap%20bar/dove%20sensitive%20skin%20soap%20bar.png",
    "featured": false,
    "cat": "Shower"
  },
  {
    "name": "Olay Soap Bar",
    "price": 5000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/soap%20bar/dove%20sensitive%20skin%20soap%20bar.png",
    "featured": false,
    "cat": "Shower"
  },
  {
    "name": "Degree Antiperspirant 2",
    "price": 8500,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/deodorant%20and%20antiperspirant/degree%20antiperspirant%20(2).png",
    "featured": false,
    "cat": "Personal"
  },
  {
    "name": "Secret Deodorant",
    "price": 8500,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/deodorant%20and%20antiperspirant/secret%20deodorant.png",
    "featured": false,
    "cat": "Personal"
  },
  {
    "name": "Palmolive Dish Soap",
    "price": 7500,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/detergent%20and%20air%20freshener/palmolive.png",
    "featured": false,
    "cat": "Household"
  },
  {
    "name": "Jasmine Rice",
    "price": 38000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/food/jasmine%20rice.png",
    "featured": false,
    "cat": "Grocery"
  },
  {
    "name": "Dove Body Wash",
    "price": 13000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/deodorant%20and%20antiperspirant/dove%20advanced%20care%20invisible+.png",
    "featured": false,
    "cat": "Shower"
  },
  {
    "name": "Irish Spring Body Wash",
    "price": 11000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/shampoo%20and%20body+face%20wash/irish%20spring%20body%20wash.png",
    "featured": false,
    "cat": "Shower"
  },
  {
    "name": "Dove Shea Butter Soap",
    "price": 4800,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/soap%20bar/dove%20sensitive%20skin%20soap%20bar.png",
    "featured": false,
    "cat": "Shower"
  },
  {
    "name": "Cetaphil Gentle Skin Cleanser",
    "price": 18000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/skin%20cleanser%20and%20moisturizer/cetaphil%20gentle%20skin%20cleanser.png",
    "featured": false,
    "cat": "Skincare"
  },
  {
    "name": "Cetaphil Moisturizing Cream",
    "price": 21000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/skin%20cleanser%20and%20moisturizer/cetaphil%20moisturizing%20cream.png",
    "featured": false,
    "cat": "Skincare"
  },
  {
    "name": "Cetaphil Skin Cleanser",
    "price": 18500,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/skin%20cleanser%20and%20moisturizer/cetaphil%20skin%20cleanser.png",
    "featured": false,
    "cat": "Skincare"
  },
  {
    "name": "Makeup Remover",
    "price": 9000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/skin%20cleanser%20and%20moisturizer/makeup%20remover.png",
    "featured": false,
    "cat": "Skincare"
  },
  {
    "name": "Members Mark Tote Bag",
    "price": 12000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/tote%20bag%20or%20lunch%20box/member's%20mark%20tote%20bag.png",
    "featured": false,
    "cat": "Bags"
  },
  {
    "name": "Pink Members Mark Tote Bag",
    "price": 12000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/tote%20bag%20or%20lunch%20box/pink%20member's%20mark%20tote%20bag.png",
    "featured": false,
    "cat": "Bags"
  },
  {
    "name": "Veronica Hampton Lunch Box",
    "price": 16000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/tote%20bag%20or%20lunch%20box/veronica%20hampton%20lunch%20box.png",
    "featured": false,
    "cat": "Bags"
  },
  {
    "name": "Vital Proteins (Less Plastic)",
    "price": 54000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/food%20bags%20and%20supplement/80%20less%20plastic%20vital%20proteins%20collagen%20peptides.png",
    "featured": false,
    "cat": "Health"
  },
  {
    "name": "Irish Spring Soap Bar",
    "price": 3000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/shampoo%20and%20body+face%20wash/irish%20spring%20body%20wash.png",
    "featured": false,
    "cat": "Shower"
  },
  {
    "name": "Vital Proteins Collagen Peptides",
    "price": 55000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/food%20bags%20and%20supplement/80%20less%20plastic%20vital%20proteins%20collagen%20peptides.png",
    "featured": true,
    "cat": "Health"
  },
  {
    "name": "Striped Members Mark Tote Bag",
    "price": 12000,
    "img": "https://zwubakrzjgptslrypqli.supabase.co/storage/v1/object/public/images/products/tote%20bag%20or%20lunch%20box/member's%20mark%20tote%20bag.png",
    "featured": false,
    "cat": "Bags"
  }
];

async function seed() {
    console.log("Starting DB Seeder...");

    try {
        await pool.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
            
            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;

            ALTER TABLE products
            ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
        `);

        console.log("Clearing tables...");
        await pool.query(`TRUNCATE TABLE products CASCADE`);
        await pool.query(`TRUNCATE TABLE categories CASCADE`);

        console.log("Seeding Categories...");
        for (const cat of categories) {
            const slug = generateSlug(cat.name);
            await pool.query(
                `INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3)`,
                [cat.id, cat.name, slug]
            );
        }

        console.log("Seeding Products...");
        for (const p of products) {
            const catId = findCatId(p.cat);
            const slug = generateSlug(p.name);
            const imageArray = [p.img]; 

            await pool.query(`
                INSERT INTO products 
                (id, name, slug, current_price, available, description, category_id, image_urls, is_featured, quantity, blurhash) 
                VALUES ($1, $2, $3, $4, true, $5, $6, $7, $8, 50, $9)
            `, [uuid(), p.name, slug, p.price, 'Premium quality imported item.', catId, JSON.stringify(imageArray), p.featured, p.blurhash || null]);
        }

        console.log("✅ Seed complete! Successfully synced with Supabase.");

    } catch (err) {
        console.error("Seeding failed: ", err);
    } finally {
        pool.end();
    }
}

seed();
