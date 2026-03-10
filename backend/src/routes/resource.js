const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getStudentResources,
    getResourcesByInternship,
    trackDownload
} = require('../controllers/resourceController');

router.use(protect);

router.get('/', getStudentResources);
router.get('/internship/:internshipId', getResourcesByInternship);
router.post('/:id/download', trackDownload);

module.exports = router;
