require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../src/db');
const supabase = require('../src/db/supabase');

const BUCKET = process.env.SUPABASE_BUCKET || 'product-images';
const FRONTEND_IMAGES_PATH = path.join(__dirname, '../../frontend/images');

// Recursive file lister
function getFiles(dir, allFiles) {
    const files = fs.readdirSync(dir);
    allFiles = allFiles || [];
    files.forEach(function(file) {
        const name = dir + '/' + file;
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, allFiles);
        } else {
            allFiles.push(name);
        }
    });
    return allFiles;
}

async function repairMigration() {
    console.log('--- Starting Repair Migration ---');
    
    try {
        // 1. Get all local files
        const localFiles = getFiles(FRONTEND_IMAGES_PATH);
        console.log(`Found ${localFiles.length} local images.`);

        // 2. Get all products
        const { rows: products } = await pool.query('SELECT id, name, image_urls FROM products WHERE deleted_at IS NULL');
        
        for (const product of products) {
            console.log(`Processing: ${product.name}`);
            
            // Try to find matching local files
            const matchedFiles = [];
            const searchName = product.name.toLowerCase().replace(/[^a-z0-9]/g, '');

            for (const localPath of localFiles) {
                const fileName = path.basename(localPath).toLowerCase().replace(/[^a-z0-9]/g, '');
                // Fuzzy match: if product name is inside filename or vice versa
                if (fileName.includes(searchName) || searchName.includes(fileName)) {
                    matchedFiles.push(localPath);
                }
            }

            // Fallback: if no direct match, look for parts of the name
            if (matchedFiles.length === 0) {
                const parts = product.name.toLowerCase().split(' ').filter(p => p.length > 3);
                for (const localPath of localFiles) {
                    const fileName = path.basename(localPath).toLowerCase();
                    if (parts.some(p => fileName.includes(p))) {
                        matchedFiles.push(localPath);
                    }
                }
            }

            if (matchedFiles.length === 0) {
                console.log(`  [!] No local file matched for "${product.name}"`);
                continue;
            }

            // Take the best matches (unique)
            const uniqueMatches = [...new Set(matchedFiles)].slice(0, 3);
            console.log(`  Found ${uniqueMatches.length} matches:`, uniqueMatches.map(p => path.basename(p)));

            const newUrls = [];
            for (const localPath of uniqueMatches) {
                const fileBuffer = fs.readFileSync(localPath);
                const ext = path.extname(localPath).toLowerCase();
                const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
                
                // Preserve folder structure relative to /images/
                const relativePath = path.relative(FRONTEND_IMAGES_PATH, localPath).replace(/\\/g, '/');
                const fileName = `products/${relativePath}`;

                console.log(`  Uploading to Supabase: ${fileName}`);
                const { data, error } = await supabase.storage
                    .from(BUCKET)
                    .upload(fileName, fileBuffer, {
                        contentType: contentType,
                        upsert: true
                    });

                if (error) {
                    console.error(`    Upload Error:`, error.message);
                    continue;
                }

                const { data: publicUrlData } = supabase.storage
                    .from(BUCKET)
                    .getPublicUrl(fileName);

                newUrls.push(publicUrlData.publicUrl);
            }

            if (newUrls.length > 0) {
                await pool.query('UPDATE products SET image_urls = $1 WHERE id = $2', [newUrls, product.id]);
                console.log(`  Successfully updated DB with ${newUrls.length} Supabase URLs.`);
            }
        }

        console.log('--- Repair Complete ---');
    } catch (err) {
        console.error('Repair failed:', err);
    } finally {
        await pool.end();
        process.exit();
    }
}

repairMigration();
