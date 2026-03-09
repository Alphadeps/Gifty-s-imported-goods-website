const pool = require('../db');

// Utility to create a slug
const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

const productController = {
    // GET /api/v1/public/products (Unsecured)
    getPublicProducts: async (req, res) => {
        try {
            // Only fetch available, non-deleted products
            const { featured } = req.query;
            let queryStr = `
                SELECT p.*, c.name as category_name, c.slug as category_slug
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.available = true AND p.deleted_at IS NULL
            `;

            if (featured === 'true') {
                queryStr += ` AND p.is_featured = true`;
            }

            queryStr += ` ORDER BY p.created_at DESC`;

            const result = await pool.query(queryStr);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching public products:', error);
            res.status(500).json({ error: 'Internal server error fetching products' });
        }
    },

    // GET /api/v1/public/products/:slug (Unsecured)
    getPublicProductBySlug: async (req, res) => {
        const { slug } = req.params;
        try {
            const result = await pool.query(`
                SELECT p.*, c.name as category_name, c.slug as category_slug
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.slug = $1 AND p.available = true AND p.deleted_at IS NULL
            `, [slug]);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching product by slug:', error);
            res.status(500).json({ error: 'Internal server error fetching product' });
        }
    },

    // GET /api/v1/admin/products (Secured)
    getAdminProducts: async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT p.*, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                ORDER BY p.created_at DESC
            `);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching admin products:', error);
            res.status(500).json({ error: 'Internal server error fetching admin products' });
        }
    },

    // POST /api/v1/admin/products
    createProduct: async (req, res) => {
        const { name, current_price, available, new_price, description, category_id, quantity, image_urls, attributes, blurhash } = req.body;

        if (!name || current_price === undefined) {
            return res.status(400).json({ error: 'Name and current_price are required' });
        }

        const slug = generateSlug(name);

        try {
            const result = await pool.query(
                `INSERT INTO products 
                (name, slug, current_price, available, new_price, description, category_id, quantity, image_urls, attributes, blurhash) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
                [
                    name,
                    slug,
                    current_price,
                    available ?? true,
                    new_price || null,
                    description || null,
                    category_id || null,
                    quantity || 0,
                    image_urls || [],
                    attributes || {},
                    blurhash || null
                ]
            );
            res.status(201).json({ id: result.rows[0].id, message: "Product created successfully.", product: result.rows[0] });
        } catch (error) {
            console.error('Error creating product:', error);
            if (error.code === '23505') {
                return res.status(409).json({ error: 'A product with this name/slug already exists' });
            }
            res.status(500).json({ error: 'Internal server error creating product' });
        }
    },

    // PUT /api/v1/admin/products
    updateProduct: async (req, res) => {
        const { id, name, current_price, available, new_price, description, category_id, quantity, image_urls, attributes } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Product ID is required for update' });
        }

        try {
            // Build dynamic update query
            const updates = [];
            const values = [];
            let valueIndex = 1;

            if (name !== undefined) {
                updates.push(`name = $${valueIndex++}`);
                values.push(name);
                updates.push(`slug = $${valueIndex++}`);
                values.push(generateSlug(name));
            }
            if (current_price !== undefined) {
                updates.push(`current_price = $${valueIndex++}`);
                values.push(current_price);
            }
            if (available !== undefined) {
                updates.push(`available = $${valueIndex++}`);
                values.push(available);
            }
            if (new_price !== undefined) {
                updates.push(`new_price = $${valueIndex++}`);
                values.push(new_price);
            }
            if (description !== undefined) {
                updates.push(`description = $${valueIndex++}`);
                values.push(description);
            }
            if (category_id !== undefined) {
                updates.push(`category_id = $${valueIndex++}`);
                values.push(category_id);
            }
            if (quantity !== undefined) {
                updates.push(`quantity = $${valueIndex++}`);
                values.push(quantity);
            }
            if (image_urls !== undefined) {
                updates.push(`image_urls = $${valueIndex++}`);
                values.push(image_urls);
            }
            if (attributes !== undefined) {
                updates.push(`attributes = $${valueIndex++}`);
                values.push(attributes);
            }
            if (blurhash !== undefined) {
                updates.push(`blurhash = $${valueIndex++}`);
                values.push(blurhash);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: 'No fields provided to update' });
            }

            values.push(id);
            const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${valueIndex} RETURNING *`;

            const result = await pool.query(query, values);

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.status(200).json({ message: "Product updated successfully.", product: result.rows[0] });

        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ error: 'Internal server error updating product' });
        }
    },

    // DELETE /api/v1/admin/products
    deleteProduct: async (req, res) => {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Product ID is required for deletion' });
        }

        try {
            // Soft delete
            const result = await pool.query(
                'UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }

            res.status(200).json({ message: "Product successfully deleted." });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ error: 'Internal server error deleting product' });
        }
    }
};

module.exports = productController;
