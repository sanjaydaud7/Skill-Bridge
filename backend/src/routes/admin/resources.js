const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const { upload } = require('../../middleware/upload');
const {
    uploadResource,
    getResources,
    getResource,
    updateResource,
    deleteResource,
    toggleResource,
    getResourceStats
} = require('../../controllers/admin/adminResourceController');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getResourceStats);
router.get('/', getResources);
router.get('/:id', getResource);

// File upload: multer handles the single 'file' field.
// For external links (type=link), no file is required — multer skips gracefully.
router.post('/', (req, res, next) => {
    if (req.body.type === 'link') return next();
    upload.single('file')(req, res, next);
}, uploadResource);

router.put('/:id', updateResource);
router.put('/:id/toggle', toggleResource);
router.delete('/:id', deleteResource);

module.exports = router;
