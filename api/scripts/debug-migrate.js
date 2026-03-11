require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const pool = require('../src/db');
const supabase = require('../src/db/supabase');

const BUCKET = process.env.SUPABASE_BUCKET || 'product-images';
const FRONTEND_IMAGES_PATH = path.join(__dirname, '../../frontend');

async function debugMigration() {
    console.log('--- Debugging Supabase Migration ---');
    console.log('Bucket:', BUCKET);
    
    try {
        // 1. Check Bucket Connection
        const { data: buckets, error: bError } = await supabase.storage.listBuckets();
        if (bError) {
            console.error('Error listing buckets:', bError);
            return;
        }
        console.log('Available buckets:', buckets.map(b => b.name));

        const bucketExists = buckets.find(b => b.name === BUCKET);
        if (!bucketExists) {
            console.error(`Bucket "${BUCKET}" does not exist!`);
            return;
        }

        // 2. Try to migrate ONE product with FORCED upload
        const { rows: products } = await pool.query('SELECT id, name, image_urls FROM products WHERE deleted_at IS NULL LIMIT 2');
        
        for (const product of products) {
            console.log(`\nTesting Product: ${product.name}`);
            for (const url of product.image_urls) {
                console.log(`  Source URL: ${url}`);
                
                let fileBuffer;
                let contentType;
                let fileName;

                if (url.startsWith('/images/')) {
                    const localPath = path.join(FRONTEND_IMAGES_PATH, url);
                    if (!fs.existsSync(localPath)) {
                        console.log(`    Local file not found: ${localPath}`);
                        continue;
                    }
                    fileBuffer = fs.readFileSync(localPath);
                    const ext = path.extname(localPath).toLowerCase();
                    contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
                    fileName = `test-migration/${Date.now()}${ext}`;
                } else if (url.includes('supabase.co')) {
                    console.log('    Already a Supabase URL, let\'s try re-uploading test if possible (ignored)');
                    continue;
                } else {
                    console.log('    Downloading external...');
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    fileBuffer = response.data;
                    contentType = response.headers['content-type'];
                    fileName = `test-migration-ext/${Date.now()}.jpg`;
                }

                console.log(`    Uploading to: ${BUCKET}/${fileName}`);
                const { data, error } = await supabase.storage
                    .from(BUCKET)
                    .upload(fileName, fileBuffer, {
                        contentType: contentType,
                        upsert: true
                    });

                if (error) {
                    console.error('    UPLOAD ERROR:', error);
                } else {
                    console.log('    UPLOAD SUCCESS:', data);
                    const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
                    console.log('    Public URL:', publicUrl.publicUrl);
                }
            }
        }

    } catch (err) {
        console.error('Debug script failed:', err);
    } finally {
        await pool.end();
        process.exit();
    }
}

debugMigration();
