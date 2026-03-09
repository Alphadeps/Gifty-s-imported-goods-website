const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');

// Product Routes (Admin)
router.get('/products', productController.getAdminProducts);
router.post('/products', productController.createProduct);
router.put('/products', productController.updateProduct);
router.delete('/products', productController.deleteProduct);

// Category Routes (Admin)
router.get('/categories', categoryController.getAllCategories);
router.post('/categories', categoryController.createCategory);
router.delete('/categories', categoryController.deleteCategory);

module.exports = router;
