const express = require('express');
const {
    getAllProducts,
    getProductById, 
    createProduct,
    updateProduct,
    deleteProduct,
    importProductsFromExcel,
} = require('../controllers/productController');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');
const { uploadImage, uploadExcel } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public access (untuk landing page user)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Hanya admin dan superAdmin yang boleh mengelola produk
router.post(
    '/',
    authenticateJWT,
    authorizeRole(['admin', 'superAdmin']),
    uploadImage.single('image'),
    createProduct
);
  
router.put(
    '/:id',
    authenticateJWT,
    authorizeRole(['admin', 'superAdmin']),
    uploadImage.single('image'),
    updateProduct
);

router.delete(
    '/:id',
    authenticateJWT,
    authorizeRole(['admin', 'superAdmin']),
    deleteProduct
);

// Admin/superAdmin only: Import via Excel
router.post(
    '/upload-excel',
    authenticateJWT,
    authorizeRole(['admin', 'superAdmin']),
    uploadExcel.single('excelFile'),
    importProductsFromExcel
);

module.exports = router;
