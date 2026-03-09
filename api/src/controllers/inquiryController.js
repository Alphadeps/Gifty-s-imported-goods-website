const pool = require('../db');

const inquiryController = {
    // POST /api/v1/public/inquiries
    createInquiry: async (req, res) => {
        const { name, phone, message } = req.body;

        if (!name || !phone || !message) {
            return res.status(400).json({ error: 'Name, phone, and message are all required' });
        }

        try {
            const result = await pool.query(
                `INSERT INTO inquiries (name, phone, message) VALUES ($1, $2, $3) RETURNING id, created_at`,
                [name, phone, message]
            );
            res.status(201).json({ message: "Inquiry submitted successfully.", id: result.rows[0].id });
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            res.status(500).json({ error: 'Internal server error submitting inquiry' });
        }
    }
};

module.exports = inquiryController;
