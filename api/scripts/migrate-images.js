require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const pool = require('../src/db');
const supabase = require('../src/db/supabase');

const BUCKET = process.env.SUPABASE_BUCKET || 'product-images';
const FRONTEND_IMAGES_PATH = path.join(__dirname, '../../frontend'); // Base path for relative images

async function migrateImages() {
    console.log('--- Starting Image Migration ---');
    
    try {
        const { rows: products } = await pool.query('SELECT id, name, image_urls FROM products WHERE deleted_at IS NULL');
        
        for (const product of products) {
            if (!product.image_urls || product.image_urls.length === 0) continue;
            
            console.log(`Processing Product: ${product.name} (ID: ${product.id})`);
            const newUrls = [];
            let changed = false;

            for (const url of product.image_urls) {
                try {
                    // Check if already in Supabase
                    if (url.includes('supabase.co')) {
                        newUrls.push(url);
                        continue;
                    }

                    let fileBuffer;
                    let contentType;
                    let fileName;

                    if (url.startsWith('/images/')) {
                    // Handle local relative paths - Preserve Structure
                    const localPath = path.join(FRONTEND_IMAGES_PATH, url);
                    if (!fs.existsSync(localPath)) {
                        console.error(`  File not found locally: ${localPath}`);
                        newUrls.push(url);
                        continue;
                    }
                    console.log(`  Reading local file: ${url}`);
                    fileBuffer = fs.readFileSync(localPath);
                    const ext = path.extname(localPath).toLowerCase();
                    contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
                    
                    // Maintain directory structure: /images/food/rice.png -> products/food/rice.png
                    fileName = url.replace(/^\/images\//, 'products/').replace(/\\/g, '/');
                } else {
                    // Handle absolute URLs - Preserve Filename
                    console.log(`  Downloading external image: ${url}`);
                    try {
                        const response = await axios.get(url, { responseType: 'arraybuffer' });
                        fileBuffer = response.data;
                        contentType = response.headers['content-type'];
                        
                        // Extract filename from URL: https://example.com/path/to/image.jpg -> image.jpg
                        const originalFileName = url.split('/').pop().split('?')[0] || `image-${Date.now()}`;
                        const folderName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        fileName = `migrated/${folderName}/${originalFileName}`;
                    } catch (e) {
                        console.error(`  Failed to download image ${url}:`, e.message);
                        newUrls.push(url);
                        continue;
                    }
                }

                    console.log(`  Uploading to Supabase: ${fileName}`);
                    const { data, error } = await supabase.storage
                        .from(BUCKET)
                        .upload(fileName, fileBuffer, {
                            contentType: contentType,
                            upsert: true
                        });

                    if (error) throw error;

                    const { data: publicUrlData } = supabase.storage
                        .from(BUCKET)
                        .getPublicUrl(fileName);

                    newUrls.push(publicUrlData.publicUrl);
                    changed = true;
                } catch (e) {
                    console.error(`  Failed to migrate image ${url}:`, e.message);
                    newUrls.push(url); // Keep old URL if migration fails
                }
            }

            if (changed) {
                await pool.query('UPDATE products SET image_urls = $1 WHERE id = $2', [newUrls, product.id]);
                console.log(`  Successfully updated product database.`);
            }
        }

        console.log('--- Migration Complete ---');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        // Pool end to close connections
        try {
            await pool.end();
        } catch (e) {}
        process.exit();
    }
}

migrateImages();
