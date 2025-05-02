const express = require('express');
const {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
} = require('../../controllers/landing-page/articleController');

const { authenticateJWT, authorizeRole } = require('../../middleware/authMiddleware');
const { uploadImage } = require('../../middleware/uploadMiddleware');

const router = express.Router();

// Public access (untuk landing page user)
router.get('/', getAllArticles);
router.get('/:id', getArticleById);

// Admin & superAdmin access only
router.post('/', authenticateJWT, authorizeRole(['admin', 'superAdmin']), uploadImage.single('image'), createArticle);
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'superAdmin']), uploadImage.single('image'),updateArticle);
router.delete('/:id', authenticateJWT, authorizeRole(['admin', 'superAdmin']), deleteArticle);

module.exports = router;
