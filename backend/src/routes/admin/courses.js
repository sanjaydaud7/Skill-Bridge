const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCourseStatus,
    duplicateCourse,
    createModule,
    updateModule,
    deleteModule,
    bulkUpdateModules,
    createTask,
    updateTask,
    deleteTask,
    createOrUpdateProject,
    getCourseStats
} = require('../../controllers/admin/adminCourseController');
const { protect, authorize } = require('../../middleware/auth');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Course routes
router.route('/')
    .get(getCourses)
    .post(createCourse);

router.route('/:id')
    .get(getCourse)
    .put(updateCourse)
    .delete(deleteCourse);

router.put('/:id/status', toggleCourseStatus);
router.post('/:id/duplicate', duplicateCourse);
router.get('/:id/stats', getCourseStats);

// Module routes
router.put('/:id/modules', bulkUpdateModules);
router.post('/:id/modules', createModule);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);

// Task routes
router.post('/:id/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

// Project routes
router.post('/:id/project', createOrUpdateProject);

module.exports = router;