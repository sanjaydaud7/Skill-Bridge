const Badge = require('../../models/Badge');
const StudentBadge = require('../../models/StudentBadge');
const RewardPoints = require('../../models/RewardPoints');
const SkillBadge = require('../../models/SkillBadge');

// @desc    Create a new badge type
// @route   POST /api/badges
// @access  Private/Admin
exports.createBadge = async(req, res) => {
    try {
        const { name, description, icon, category, condition, requiredValue, rarity, points, relatedSkill, internshipId } = req.body;

        const badge = new Badge({
            name,
            description,
            icon,
            category,
            condition,
            requiredValue,
            rarity,
            points,
            relatedSkill,
            internshipId
        });

        await badge.save();

        res.status(201).json({
            success: true,
            data: badge
        });
    } catch (error) {
        console.error('Error creating badge:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating badge',
            error: error.message
        });
    }
};

// @desc    Get all badges
// @route   GET /api/badges
// @access  Private
exports.getAllBadges = async(req, res) => {
    try {
        const { category, rarity } = req.query;

        let query = { isActive: true };
        if (category) query.category = category;
        if (rarity) query.rarity = rarity;

        const badges = await Badge.find(query);

        res.json({
            success: true,
            data: badges
        });
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching badges',
            error: error.message
        });
    }
};

// @desc    Get badges for internship
// @route   GET /api/badges/internship/:internshipId
// @access  Private
exports.getInternshipBadges = async(req, res) => {
    try {
        const { internshipId } = req.params;

        const badges = await Badge.find({
            internshipId,
            isActive: true
        });

        res.json({
            success: true,
            data: badges
        });
    } catch (error) {
        console.error('Error fetching internship badges:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching internship badges',
            error: error.message
        });
    }
};

// @desc    Get student's earned badges
// @route   GET /api/badges/student/:userId
// @access  Private
exports.getStudentBadges = async(req, res) => {
    try {
        const { userId } = req.params;

        const studentBadges = await StudentBadge.find({ userId })
            .populate('badgeId')
            .sort({ earnedAt: -1 });

        const badges = studentBadges.map(sb => ({
            ...sb.badgeId.toObject(),
            earnedAt: sb.earnedAt,
            earnedFrom: sb.earnedFrom
        }));

        res.json({
            success: true,
            count: badges.length,
            data: badges
        });
    } catch (error) {
        console.error('Error fetching student badges:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student badges',
            error: error.message
        });
    }
};

// @desc    Award badge to student
// @route   POST /api/badges/award
// @access  Private/Admin
exports.awardBadge = async(req, res) => {
    try {
        const { userId, badgeId, enrollmentId, earnedFrom, earnedFromId } = req.body;

        const badge = await Badge.findById(badgeId);
        if (!badge) {
            return res.status(404).json({
                success: false,
                message: 'Badge not found'
            });
        }

        try {
            const studentBadge = new StudentBadge({
                userId,
                badgeId,
                enrollmentId,
                earnedFrom: earnedFrom || 'manual-award',
                earnedFromId
            });

            await studentBadge.save();

            // Award points for badge
            let rewardPoints = await RewardPoints.findOne({ userId });
            if (!rewardPoints) {
                rewardPoints = new RewardPoints({ userId });
            }
            rewardPoints.totalPoints += badge.points;
            rewardPoints.availablePoints += badge.points;
            rewardPoints.pointsHistory.push({
                amount: badge.points,
                source: 'badge-earned',
                sourceId: badgeId,
                description: `Earned badge: ${badge.name}`
            });
            await rewardPoints.save();

            res.status(201).json({
                success: true,
                data: studentBadge
            });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: 'Student already has this badge'
                });
            }
            throw err;
        }
    } catch (error) {
        console.error('Error awarding badge:', error);
        res.status(500).json({
            success: false,
            message: 'Error awarding badge',
            error: error.message
        });
    }
};

// @desc    Get skill badge progress
// @route   GET /api/badges/skill/:userId
// @access  Private
exports.getSkillBadges = async(req, res) => {
    try {
        const { userId } = req.params;

        const skillBadges = await SkillBadge.find({ userId }).sort({ proficiencyScore: -1 });

        res.json({
            success: true,
            count: skillBadges.length,
            data: skillBadges
        });
    } catch (error) {
        console.error('Error fetching skill badges:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching skill badges',
            error: error.message
        });
    }
};

// @desc    Update skill proficiency
// @route   PUT /api/badges/skill/:skillBadgeId
// @access  Private
exports.updateSkillProficiency = async(req, res) => {
    try {
        const { skillBadgeId } = req.params;
        const { proficiencyScore, level, tasksCompleted, projectsCompleted } = req.body;

        const skillBadge = await SkillBadge.findByIdAndUpdate(
            skillBadgeId, {
                proficiencyScore,
                level,
                tasksCompleted,
                projectsCompleted,
                estimatedProficiency: proficiencyScore < 40 ? 'low' : proficiencyScore < 70 ? 'moderate' : proficiencyScore < 90 ? 'high' : 'expert'
            }, { new: true }
        );

        if (!skillBadge) {
            return res.status(404).json({
                success: false,
                message: 'Skill badge not found'
            });
        }

        res.json({
            success: true,
            data: skillBadge
        });
    } catch (error) {
        console.error('Error updating skill proficiency:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating skill proficiency',
            error: error.message
        });
    }
};

// @desc    Endorse a skill
// @route   POST /api/badges/skill/:skillBadgeId/endorse
// @access  Private
exports.endorseSkill = async(req, res) => {
    try {
        const { skillBadgeId } = req.params;
        const { endorserId } = req.body;

        const skillBadge = await SkillBadge.findById(skillBadgeId);
        if (!skillBadge) {
            return res.status(404).json({
                success: false,
                message: 'Skill badge not found'
            });
        }

        // Check if already endorsed by this person
        if (skillBadge.endorsedBy.includes(endorserId)) {
            return res.status(400).json({
                success: false,
                message: 'You have already endorsed this skill'
            });
        }

        skillBadge.endorsements++;
        skillBadge.endorsedBy.push(endorserId);
        await skillBadge.save();

        res.json({
            success: true,
            data: skillBadge
        });
    } catch (error) {
        console.error('Error endorsing skill:', error);
        res.status(500).json({
            success: false,
            message: 'Error endorsing skill',
            error: error.message
        });
    }
};

// @desc    Get badge details with student counts
// @route   GET /api/badges/:badgeId/stats
// @access  Private
exports.getBadgeStats = async(req, res) => {
    try {
        const { badgeId } = req.params;

        const badge = await Badge.findById(badgeId);
        if (!badge) {
            return res.status(404).json({
                success: false,
                message: 'Badge not found'
            });
        }

        const earnedCount = await StudentBadge.countDocuments({ badgeId });

        res.json({
            success: true,
            data: {
                badge,
                earnedCount,
                rarity: badge.rarity,
                category: badge.category
            }
        });
    } catch (error) {
        console.error('Error fetching badge stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching badge stats',
            error: error.message
        });
    }
};