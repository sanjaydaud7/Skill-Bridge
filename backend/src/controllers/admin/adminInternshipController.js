const Internship = require('../../models/Internship');
const Module = require('../../models/Module');
const Task = require('../../models/Task');
const FinalProject = require('../../models/FinalProject');
const Enrollment = require('../../models/Enrollment');
const AdminLog = require('../../models/AdminLog');

// @desc    Get all courses for admin
// @route   GET /api/admin/internships
// @access  Private/Admin
exports.getCourses = async(req, res) => {
    try {
        const { category, difficulty, status, search, page = 1, limit = 10 } = req.query;

        // Build query
        const query = {};
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (status) query.isActive = status === 'active';
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const courses = await Internship.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Internship.countDocuments(query);

        res.json({
            success: true,
            data: courses,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching internships:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching internships',
            error: error.message
        });
    }
};

// @desc    Get single course details for admin
// @route   GET /api/admin/internships/:id
// @access  Private/Admin
exports.getCourse = async(req, res) => {
    try {
        const course = await Internship.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        // Get modules, tasks, and project
        const modules = await Module.find({ courseId: course._id }).sort({ order: 1 });
        const tasks = await Task.find({ courseId: course._id }).sort({ order: 1 });
        const project = await FinalProject.findOne({ courseId: course._id });
        const enrollmentCount = await Enrollment.countDocuments({ courseId: course._id });

        res.json({
            success: true,
            data: {
                course,
                modules,
                tasks,
                project,
                enrollmentCount
            }
        });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching internship',
            error: error.message
        });
    }
};

// @desc    Create new course
// @route   POST /api/admin/internships
// @access  Private/Admin
exports.createCourse = async(req, res) => {
    try {
        const courseData = {
            ...req.body,
            createdBy: req.user._id
        };

        // If image was uploaded, use Cloudinary URL
        if (req.file) {
            courseData.thumbnail = req.file.path;
        }

        // Parse JSON fields that come from FormData
        if (typeof courseData.skills === 'string') {
            try {
                courseData.skills = JSON.parse(courseData.skills);
            } catch (e) {
                courseData.skills = [];
            }
        }
        if (typeof courseData.learningOutcomes === 'string') {
            try {
                courseData.learningOutcomes = JSON.parse(courseData.learningOutcomes);
            } catch (e) {
                courseData.learningOutcomes = [];
            }
        }
        if (typeof courseData.prerequisites === 'string') {
            try {
                courseData.prerequisites = JSON.parse(courseData.prerequisites);
            } catch (e) {
                courseData.prerequisites = [];
            }
        }

        const course = await Internship.create(courseData);

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'create',
            targetModel: 'internship',
            targetId: course._id,
            description: `Created internship: ${course.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            success: true,
            message: 'Internship created successfully',
            data: course
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating internship',
            error: error.message
        });
    }
};

// @desc    Update course
// @route   PUT /api/admin/internships/:id
// @access  Private/Admin
exports.updateCourse = async(req, res) => {
    try {
        const course = await Internship.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        const oldData = course.toObject();

        // If new image was uploaded, use Cloudinary URL
        if (req.file) {
            req.body.thumbnail = req.file.path;
        }

        // Parse JSON fields that come from FormData
        if (typeof req.body.skills === 'string') {
            try {
                req.body.skills = JSON.parse(req.body.skills);
            } catch (e) {
                // Keep as is if parsing fails
            }
        }
        if (typeof req.body.learningOutcomes === 'string') {
            try {
                req.body.learningOutcomes = JSON.parse(req.body.learningOutcomes);
            } catch (e) {
                // Keep as is if parsing fails
            }
        }
        if (typeof req.body.prerequisites === 'string') {
            try {
                req.body.prerequisites = JSON.parse(req.body.prerequisites);
            } catch (e) {
                // Keep as is if parsing fails
            }
        }

        Object.assign(course, req.body);
        await course.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'update',
            targetModel: 'internship',
            targetId: course._id,
            changes: { old: oldData, new: course.toObject() },
            description: `Updated internship: ${course.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Internship updated successfully',
            data: course
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating internship',
            error: error.message
        });
    }
};

// @desc    Delete course (soft delete)
// @route   DELETE /api/admin/internships/:id
// @access  Private/Admin
exports.deleteCourse = async(req, res) => {
    try {
        const course = await Internship.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        // Check if there are active enrollments
        const enrollmentCount = await Enrollment.countDocuments({
            courseId: course._id,
            status: { $in: ['enrolled', 'in-progress'] }
        });

        if (enrollmentCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete course with ${enrollmentCount} active enrollments. Please archive it instead.`
            });
        }

        course.isActive = false;
        await course.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'delete',
            targetModel: 'internship',
            targetId: course._id,
            description: `Deleted internship: ${course.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Internship deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting internship',
            error: error.message
        });
    }
};

// @desc    Toggle course active status
// @route   PUT /api/admin/internships/:id/status
// @access  Private/Admin
exports.toggleCourseStatus = async(req, res) => {
    try {
        const course = await Internship.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        course.isActive = !course.isActive;
        await course.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'status_change',
            targetModel: 'internship',
            targetId: course._id,
            description: `${course.isActive ? 'Activated' : 'Deactivated'} internship: ${course.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: `Internship ${course.isActive ? 'activated' : 'deactivated'} successfully`,
            data: course
        });
    } catch (error) {
        console.error('Error toggling course status:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling internship status',
            error: error.message
        });
    }
};

// @desc    Duplicate course
// @route   POST /api/admin/internships/:id/duplicate
// @access  Private/Admin
exports.duplicateCourse = async(req, res) => {
    try {
        const originalCourse = await Internship.findById(req.params.id);

        if (!originalCourse) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        // Create new course
        const courseData = originalCourse.toObject();
        delete courseData._id;
        delete courseData.createdAt;
        delete courseData.updatedAt;
        courseData.title = `${courseData.title} (Copy)`;
        courseData.slug = `${courseData.slug}-copy-${Date.now()}`;
        courseData.createdBy = req.user._id;
        courseData.enrollmentCount = 0;

        const newCourse = await Internship.create(courseData);

        // Duplicate modules
        const modules = await Module.find({ courseId: originalCourse._id });
        for (const module of modules) {
            const moduleData = module.toObject();
            delete moduleData._id;
            delete moduleData.createdAt;
            delete moduleData.updatedAt;
            moduleData.courseId = newCourse._id;
            await Module.create(moduleData);
        }

        // Duplicate tasks
        const tasks = await Task.find({ courseId: originalCourse._id });
        for (const task of tasks) {
            const taskData = task.toObject();
            delete taskData._id;
            delete taskData.createdAt;
            delete taskData.updatedAt;
            taskData.courseId = newCourse._id;
            await Task.create(taskData);
        }

        // Duplicate project
        const project = await FinalProject.findOne({ courseId: originalCourse._id });
        if (project) {
            const projectData = project.toObject();
            delete projectData._id;
            delete projectData.createdAt;
            delete projectData.updatedAt;
            projectData.courseId = newCourse._id;
            await FinalProject.create(projectData);
        }

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'create',
            targetModel: 'internship',
            targetId: newCourse._id,
            description: `Duplicated course: ${originalCourse.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            success: true,
            message: 'Internship duplicated successfully',
            data: newCourse
        });
    } catch (error) {
        console.error('Error duplicating course:', error);
        res.status(500).json({
            success: false,
            message: 'Error duplicating internship',
            error: error.message
        });
    }
};

// @desc    Create module
// @route   POST /api/admin/internships/:id/modules
// @access  Private/Admin
exports.createModule = async(req, res) => {
    try {
        const course = await Internship.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        const moduleData = {
            ...req.body,
            courseId: course._id
        };

        const module = await Module.create(moduleData);

        // Update course module count
        course.totalModules = await Module.countDocuments({ courseId: course._id });
        await course.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'create',
            targetModel: 'Module',
            targetId: module._id,
            description: `Created module: ${module.title} in internship: ${course.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            success: true,
            message: 'Module created successfully',
            data: module
        });
    } catch (error) {
        console.error('Error creating module:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating module',
            error: error.message
        });
    }
};

// @desc    Update module
// @route   PUT /api/admin/modules/:id
// @access  Private/Admin
exports.updateModule = async(req, res) => {
    try {
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        Object.assign(module, req.body);
        await module.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'update',
            targetModel: 'Module',
            targetId: module._id,
            description: `Updated module: ${module.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Module updated successfully',
            data: module
        });
    } catch (error) {
        console.error('Error updating module:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating module',
            error: error.message
        });
    }
};

// @desc    Delete module
// @route   DELETE /api/admin/modules/:id
// @access  Private/Admin
exports.deleteModule = async(req, res) => {
    try {
        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        const courseId = module.courseId;
        await module.deleteOne();

        // Update course module count
        const course = await Internship.findById(courseId);
        if (course) {
            course.totalModules = await Module.countDocuments({ courseId });
            await course.save();
        }

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'delete',
            targetModel: 'Module',
            targetId: module._id,
            description: `Deleted module: ${module.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Module deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting module:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting module',
            error: error.message
        });
    }
};

// @desc    Bulk update/create modules for a course
// @route   PUT /api/admin/internships/:id/modules
// @access  Private/Admin
exports.bulkUpdateModules = async(req, res) => {
    try {
        const course = await Internship.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        const { modules } = req.body;

        if (!modules || !Array.isArray(modules)) {
            return res.status(400).json({
                success: false,
                message: 'Modules array is required'
            });
        }

        // Delete existing modules for this course
        await Module.deleteMany({ courseId: course._id });

        // Create new modules
        const createdModules = [];
        for (let i = 0; i < modules.length; i++) {
            const mod = modules[i];

            // Sanitize: remove incomplete video entries before saving
            const sanitizedVideos = Array.isArray(mod.videos) ?
                mod.videos.filter(v => v && v.title && v.title.trim() && v.videoUrl && v.videoUrl.trim()) : [];

            const moduleData = {
                ...mod,
                videos: sanitizedVideos,
                courseId: course._id,
                order: mod.order || i + 1
            };
            const module = await Module.create(moduleData);
            createdModules.push(module);
        }

        // Update course module count
        course.totalModules = createdModules.length;
        await course.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'update',
            targetModel: 'internship',
            targetId: course._id,
            description: `Updated curriculum for internship: ${course.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Curriculum updated successfully',
            data: createdModules
        });
    } catch (error) {
        console.error('Error updating modules:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating modules',
            error: error.message
        });
    }
};

// @desc    Create task
// @route   POST /api/admin/internships/:id/tasks
// @access  Private/Admin
exports.createTask = async(req, res) => {
    try {
        const course = await Internship.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        const taskData = {
            ...req.body,
            courseId: course._id
        };

        const task = await Task.create(taskData);

        // Update course task count
        course.totalTasks = await Task.countDocuments({ courseId: course._id });
        await course.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'create',
            targetModel: 'Task',
            targetId: task._id,
            description: `Created task: ${task.title} in internship: ${course.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating task',
            error: error.message
        });
    }
};

// @desc    Update task
// @route   PUT /api/admin/tasks/:id
// @access  Private/Admin
exports.updateTask = async(req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        Object.assign(task, req.body);
        await task.save();

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'update',
            targetModel: 'Task',
            targetId: task._id,
            description: `Updated task: ${task.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating task',
            error: error.message
        });
    }
};

// @desc    Delete task
// @route   DELETE /api/admin/tasks/:id
// @access  Private/Admin
exports.deleteTask = async(req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const courseId = task.courseId;
        await task.deleteOne();

        // Update course task count
        const course = await Internship.findById(courseId);
        if (course) {
            course.totalTasks = await Task.countDocuments({ courseId });
            await course.save();
        }

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: 'delete',
            targetModel: 'Task',
            targetId: task._id,
            description: `Deleted task: ${task.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting task',
            error: error.message
        });
    }
};

// @desc    Create or update final project
// @route   POST /api/admin/internships/:id/project
// @access  Private/Admin
exports.createOrUpdateProject = async(req, res) => {
    try {
        const course = await Internship.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        let project = await FinalProject.findOne({ courseId: course._id });

        if (project) {
            // Update existing
            Object.assign(project, req.body);
            await project.save();
        } else {
            // Create new
            project = await FinalProject.create({
                ...req.body,
                courseId: course._id
            });
        }

        // Log action
        await AdminLog.createLog({
            adminId: req.user._id,
            action: project.isNew ? 'create' : 'update',
            targetModel: 'FinalProject',
            targetId: project._id,
            description: `${project.isNew ? 'Created' : 'Updated'} final project for internship: ${course.title}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            message: `Final project ${project.isNew ? 'created' : 'updated'} successfully`,
            data: project
        });
    } catch (error) {
        console.error('Error creating/updating project:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating/updating project',
            error: error.message
        });
    }
};

// @desc    Get course statistics
// @route   GET /api/admin/internships/:id/stats
// @access  Private/Admin
exports.getCourseStats = async(req, res) => {
    try {
        const course = await Internship.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        const enrollments = await Enrollment.find({ courseId: course._id });
        const totalEnrollments = enrollments.length;
        const activeEnrollments = enrollments.filter(e => ['enrolled', 'in-progress'].includes(e.status)).length;
        const completedEnrollments = enrollments.filter(e =>
            e.status === 'completed'
        ).length;

        const avgProgress = enrollments.length > 0 ?
            enrollments.reduce((sum, e) => sum + ((e.progress && e.progress.completionPercentage) || 0), 0) / enrollments.length :
            0;

        res.json({
            success: true,
            data: {
                totalEnrollments,
                activeEnrollments,
                completedEnrollments,
                avgProgress: Math.round(avgProgress),
                moduleCount: await Module.countDocuments({ courseId: course._id }),
                taskCount: await Task.countDocuments({ courseId: course._id })
            }
        });
    } catch (error) {
        console.error('Error fetching course stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching internship statistics',
            error: error.message
        });
    }
};