const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const TaskSubmission = require('../models/TaskSubmission');

// Lazy-load optional packages so missing deps don't crash the server
let OpenAI, PDFDocument;
try { OpenAI = require('openai'); } catch (_) { OpenAI = null; }
try { PDFDocument = require('pdfkit'); } catch (_) { PDFDocument = null; }

const getOpenAIClient = () => OpenAI ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// ─── Helper: gather student data ──────────────────────────────────────────────
const gatherStudentData = async (userId) => {
    const user = await User.findById(userId).select('name email createdAt');

    const enrollments = await Enrollment.find({ userId })
        .populate('courseId', 'title category skills duration difficulty learningOutcomes')
        .sort({ enrolledAt: -1 });

    const certificates = await Certificate.find({ userId, isValid: true })
        .populate('courseId', 'title category')
        .sort({ issuedAt: -1 });

    const approved = await TaskSubmission.find({ userId, status: 'approved' })
        .populate('taskId', 'title')
        .limit(20);

    const allSkills = new Set();
    enrollments.forEach(e => e.courseId?.skills?.forEach(s => allSkills.add(s)));
    certificates.forEach(c => c.skills?.forEach(s => allSkills.add(s)));

    return { user, enrollments, certificates, approved, skills: [...allSkills] };
};

// ─── Generate AI Content ──────────────────────────────────────────────────────
const generateAIContent = async (data) => {
    const { user, enrollments, certificates, skills } = data;

    const internshipSummary = enrollments
        .filter(e => e.courseId)
        .map(e => `- ${e.courseId.title} (${e.courseId.category}, ${e.courseId.duration} weeks) — Status: ${e.status}`)
        .join('\n');

    const certSummary = certificates
        .map(c => `- ${c.courseId?.title} — Grade: ${c.grade}`)
        .join('\n');

    const prompt = `
You are a professional resume writer. Generate polished resume content for a student.

Student: ${user.name}
Email: ${user.email}

Completed Internships:
${internshipSummary || 'None yet'}

Certificates Earned:
${certSummary || 'None yet'}

Skills: ${skills.join(', ') || 'Various technical skills'}

Generate the following sections in JSON:
{
  "objective": "2-3 sentence professional objective/summary",
  "highlights": ["3-5 bullet points of key achievements"],
  "internships": [{ "title": "", "description": "2-3 bullet points of what was learned/accomplished", "skills": [] }],
  "skills_grouped": { "Technical": [], "Soft Skills": [], "Tools": [] }
}
Only return valid JSON.
`;

    if (!OpenAI || !process.env.OPENAI_API_KEY) {
        // Fallback if no API key or openai package not available
        return {
            objective: `${user.name} is a motivated tech professional who has completed industry-relevant internship programs on SkillBridge, acquiring hands-on skills in modern technologies through project-based learning.`,
            highlights: [
                `Completed ${enrollments.length} internship program(s) on SkillBridge`,
                `Earned ${certificates.length} verified certificate(s)`,
                `Demonstrated proficiency in: ${skills.slice(0, 5).join(', ')}`,
                'Built and submitted real-world projects reviewed by industry mentors',
                'Consistently met project deadlines and quality standards'
            ],
            internships: enrollments.filter(e => e.courseId).map(e => ({
                title: e.courseId.title,
                description: `Completed a ${e.courseId.duration}-week program in ${e.courseId.category}. Worked on structured tasks and delivered a final project demonstrating skills in ${(e.courseId.skills || []).slice(0, 3).join(', ')}.`,
                skills: e.courseId.skills || []
            })),
            skills_grouped: {
                'Technical': skills.filter((_, i) => i % 3 === 0),
                'Soft Skills': ['Problem Solving', 'Time Management', 'Communication', 'Teamwork'],
                'Tools': skills.filter((_, i) => i % 3 !== 0).slice(0, 5)
            }
        };
    }

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1000
    });

    return JSON.parse(completion.choices[0].message.content);
};

// ─── Build PDF ────────────────────────────────────────────────────────────────
const buildResumePDF = (res, data, aiContent) => {
    if (!PDFDocument) {
        return res.status(503).json({ success: false, message: 'PDF generation unavailable (pdfkit not installed)' });
    }
    const { user, certificates, skills } = data;
    const { objective, highlights, internships, skills_grouped } = aiContent;

    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="SkillBridge_Resume_${user.name.replace(/\s/g, '_')}.pdf"`);
    doc.pipe(res);

    const W = 595.28, H = 841.89;
    const NAVY = '#0D1B4B', GOLD = '#C9940A', LIGHT = '#f8fafc', TEXT = '#1e293b', MUTED = '#64748b';
    const SB_W = 185; // sidebar width

    // ── Sidebar ───────────────────────────────────────────────────────────────
    doc.rect(0, 0, SB_W, H).fill(NAVY);
    doc.rect(SB_W, 0, 4, H).fill(GOLD);

    // Profile circle
    doc.circle(SB_W / 2, 80, 44).fill('#162362');
    doc.circle(SB_W / 2, 80, 44).lineWidth(3).strokeColor(GOLD).stroke();
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    doc.fontSize(28).fillColor(GOLD).font('Helvetica-Bold').text(initials, SB_W / 2 - 20, 65, { width: 40, align: 'center' });

    // Name + email
    doc.fontSize(13).fillColor('#ffffff').font('Helvetica-Bold').text(user.name, 12, 138, { width: SB_W - 24, align: 'center' });
    doc.fontSize(8).fillColor('#94a3b8').font('Helvetica').text(user.email, 12, 156, { width: SB_W - 24, align: 'center' });

    // SkillBridge badge
    doc.roundedRect(20, 172, SB_W - 40, 20, 4).fill(GOLD);
    doc.fontSize(8).fillColor(NAVY).font('Helvetica-Bold').text('SkillBridge Certified', 20, 177, { width: SB_W - 40, align: 'center', characterSpacing: 1 });

    // Skills section
    let sbY = 210;
    doc.fontSize(9).fillColor(GOLD).font('Helvetica-Bold').text('━  SKILLS', 16, sbY, { characterSpacing: 2 });
    sbY += 16;
    skills.slice(0, 14).forEach(skill => {
        doc.roundedRect(16, sbY, SB_W - 32, 16, 3).fill('#162362');
        doc.fontSize(7.5).fillColor('#e2e8f0').font('Helvetica').text(skill, 16, sbY + 4, { width: SB_W - 32, align: 'center' });
        sbY += 20;
    });

    // Certs section
    if (certificates.length > 0) {
        sbY += 8;
        doc.fontSize(9).fillColor(GOLD).font('Helvetica-Bold').text('━  CERTIFICATES', 16, sbY, { characterSpacing: 2 });
        sbY += 16;
        certificates.slice(0, 4).forEach(c => {
            doc.fontSize(7.5).fillColor('#e2e8f0').font('Helvetica').text(`✦ ${c.courseId?.title || 'Certificate'}`, 16, sbY, { width: SB_W - 32 });
            sbY += 14;
            doc.fontSize(7).fillColor(GOLD).text(`  Grade: ${c.grade}`, 16, sbY, { width: SB_W - 32 });
            sbY += 16;
        });
    }

    // Portfolio link at bottom
    doc.fontSize(7).fillColor('#94a3b8').text(`skillbridge.io/portfolio/${user.name.replace(/\s+/g, '-')}`, 12, H - 24, { width: SB_W - 24, align: 'center' });

    // ── Main Content ──────────────────────────────────────────────────────────
    const MX = SB_W + 24; // main x start
    const MW = W - MX - 24; // main width
    let y = 36;

    // Name header
    doc.fontSize(26).fillColor(NAVY).font('Helvetica-Bold').text(user.name, MX, y, { width: MW });
    y += 34;
    doc.fontSize(11).fillColor(GOLD).font('Helvetica-Bold').text('SOFTWARE DEVELOPER & TECH INTERN', MX, y, { width: MW, characterSpacing: 1 });
    y += 14;
    doc.moveTo(MX, y).lineTo(W - 24, y).lineWidth(2).strokeColor(GOLD).stroke();
    y += 12;

    // Objective
    doc.fontSize(9).fillColor(NAVY).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY', MX, y, { characterSpacing: 1.5 });
    y += 14;
    doc.fontSize(9.5).fillColor(TEXT).font('Helvetica').text(objective || '', MX, y, { width: MW, lineGap: 3 });
    y += doc.heightOfString(objective || '', { width: MW }) + 14;

    // Key Highlights
    if (highlights && highlights.length) {
        doc.fontSize(9).fillColor(NAVY).font('Helvetica-Bold').text('KEY HIGHLIGHTS', MX, y, { characterSpacing: 1.5 });
        y += 14;
        highlights.forEach(h => {
            doc.rect(MX, y + 3, 5, 5).fill(GOLD);
            doc.fontSize(9).fillColor(TEXT).font('Helvetica').text(h, MX + 10, y, { width: MW - 10, lineGap: 2 });
            y += doc.heightOfString(h, { width: MW - 10 }) + 8;
        });
        y += 6;
    }

    // Internship Experience
    doc.moveTo(MX, y).lineTo(W - 24, y).lineWidth(0.5).strokeColor('#e2e8f0').stroke();
    y += 10;
    doc.fontSize(9).fillColor(NAVY).font('Helvetica-Bold').text('INTERNSHIP EXPERIENCE', MX, y, { characterSpacing: 1.5 });
    y += 14;

    (internships || []).slice(0, 3).forEach(intern => {
        doc.fontSize(11).fillColor(NAVY).font('Helvetica-Bold').text(intern.title || '', MX, y, { width: MW });
        y += 14;
        doc.fontSize(8.5).fillColor(MUTED).font('Helvetica-Oblique').text('SkillBridge Virtual Internship', MX, y);
        y += 13;
        doc.fontSize(9).fillColor(TEXT).font('Helvetica').text(intern.description || '', MX + 8, y, { width: MW - 8, lineGap: 2 });
        y += doc.heightOfString(intern.description || '', { width: MW - 8 }) + 6;

        if (intern.skills && intern.skills.length > 0) {
            let bx = MX + 8;
            intern.skills.slice(0, 5).forEach(skill => {
                const bw = doc.widthOfString(skill, { fontSize: 7 }) + 12;
                if (bx + bw > W - 24) return;
                doc.roundedRect(bx, y, bw, 14, 3).fill(NAVY);
                doc.fontSize(7).fillColor('#E8B84B').text(skill, bx, y + 3.5, { width: bw, align: 'center' });
                bx += bw + 4;
            });
            y += 20;
        }
        y += 8;
        if (y > H - 60) return;
    });

    doc.end();
};

// @desc  Preview AI resume data (JSON)
// @route GET /api/resume/preview
// @access Private
exports.previewResume = async (req, res) => {
    try {
        const data = await gatherStudentData(req.user.id);
        const aiContent = await generateAIContent(data);
        res.json({ success: true, data: { student: { name: data.user.name, email: data.user.email }, aiContent, skills: data.skills, certificates: data.certificates.length } });
    } catch (err) {
        console.error('[Resume] Preview error:', err);
        res.status(500).json({ success: false, message: 'Error generating resume preview' });
    }
};

// @desc  Download AI-generated resume PDF
// @route GET /api/resume/download
// @access Private
exports.downloadResume = async (req, res) => {
    try {
        const data = await gatherStudentData(req.user.id);
        const aiContent = await generateAIContent(data);
        buildResumePDF(res, data, aiContent);
    } catch (err) {
        console.error('[Resume] Download error:', err);
        if (!res.headersSent) res.status(500).json({ success: false, message: 'Error generating resume PDF' });
    }
};
