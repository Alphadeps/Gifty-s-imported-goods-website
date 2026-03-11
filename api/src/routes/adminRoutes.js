const express = require('express');
const router = express.Router();
const multer = require('multer');

const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');

// Configure Multer for memory storage
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Product Routes (Admin)
router.get('/products', productController.getAdminProducts);
router.post('/products', productController.createProduct);
router.put('/products', productController.updateProduct);
router.delete('/products', productController.deleteProduct);

// Upload Route
router.post('/upload-image', upload.single('image'), productController.uploadImage);

// Category Routes (Admin)
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', categoryController.createCategory);
router.delete('/categories', categoryController.deleteCategory);

module.exports = router;
