const pool = require('../db');

// Utility to create a slug from a string
const generateSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-');     // Replace multiple - with single -
};

const categoryController = {
    // GET /api/v1/admin/categories
    getAllCategories: async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({ error: 'Internal server error fetching categories' });
        }
    },

    // POST /api/v1/admin/categories
    createCategory: async (req, res) => {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const slug = generateSlug(name);

        try {
            const result = await pool.query(
                'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *',
                [name, slug]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating category:', error);
            if (error.code === '23505') { // Unique violation
                return res.status(409).json({ error: 'A category with this name/slug already exists' });
            }
            res.status(500).json({ error: 'Internal server error creating category' });
        }
    },

    // DELETE /api/v1/admin/categories
    deleteCategory: async (req, res) => {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: 'Category ID is required' });
        }

        try {
            const result = await pool.query(
                'DELETE FROM categories WHERE id = $1 RETURNING id',
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Category not found' });
            }

            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ error: 'Internal server error deleting category' });
        }
    }
};

module.exports = categoryController;
