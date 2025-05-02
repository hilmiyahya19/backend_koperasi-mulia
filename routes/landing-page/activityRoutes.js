const express = require('express');
const {
    getAllActivities,
    getActivityById,
    createActivity,
    updateActivity,
    deleteActivity,
} = require('../../controllers/landing-page/activityController');

const { authenticateJWT, authorizeRole } = require('../../middleware/authMiddleware');
const { uploadImage } = require('../../middleware/uploadMiddleware');

const router = express.Router();

// Public access (untuk landing page user)
router.get('/', getAllActivities);
router.get('/:id', getActivityById);

// Admin & superAdmin access only
router.post('/', authenticateJWT, authorizeRole(['admin', 'superAdmin']), uploadImage.single('image'), createActivity);
router.put('/:id', authenticateJWT, authorizeRole(['admin', 'superAdmin']), uploadImage.single('image'),updateActivity);
router.delete('/:id', authenticateJWT, authorizeRole(['admin', 'superAdmin']), deleteActivity);

module.exports = router;
