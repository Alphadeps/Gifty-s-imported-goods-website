const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const inquiryController = require('../controllers/inquiryController');
const configController = require('../controllers/configController');

// Super Strict Limiter specifically for contact form to prevent spam
const inquiryLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 3, // Limit each IP to 3 distinct inquiries per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many inquiries submitted from this IP, please try again later.'
});

// GET /api/v1/public/products (Grid view)
router.get('/products', productController.getPublicProducts);

// GET /api/v1/public/products/:slug (SEO Individual Card View)
router.get('/products/:slug', productController.getPublicProductBySlug);

// GET /api/v1/public/categories
router.get('/categories', categoryController.getAllCategories);

// POST /api/v1/public/inquiries (Contact Form)
router.post('/inquiries', inquiryLimiter, inquiryController.createInquiry);

module.exports = router;
