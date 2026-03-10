let nodemailer;
try {
    nodemailer = require('nodemailer');
} catch (_) {
    nodemailer = null;
}

// Create transporter (works with Gmail, Outlook, or any SMTP)
const createTransporter = () => {
    if (!nodemailer) return null;
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER || process.env.SMTP_USER,
            pass: process.env.EMAIL_PASS || process.env.SMTP_PASSWORD
        }
    });
};

const FROM = `"SkillBridge" <${process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@skillbridge.io'}>`;

const isEmailConfigured = () => !!(nodemailer && (process.env.EMAIL_USER || process.env.SMTP_USER));

// ─── HTML Template Wrapper ────────────────────────────────────────────────────
const htmlWrapper = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${title}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
  .header { background: linear-gradient(135deg, #0D1B4B 0%, #162362 100%); padding: 32px 40px; text-align: center; }
  .header h1 { color: #E8B84B; margin: 0; font-size: 26px; letter-spacing: 2px; }
  .header span { color: #fff; font-size: 13px; letter-spacing: 1px; }
  .body { padding: 36px 40px; color: #1A1A2E; }
  .body h2 { color: #0D1B4B; margin-top: 0; }
  .body p { line-height: 1.7; color: #3D3D5C; }
  .btn { display: inline-block; margin-top: 20px; padding: 14px 32px; background: linear-gradient(135deg, #C9940A, #E8B84B); color: #0D1B4B; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; }
  .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: bold; margin-bottom: 16px; }
  .badge-success { background: #d1fae5; color: #065f46; }
  .badge-danger  { background: #fee2e2; color: #991b1b; }
  .badge-info    { background: #dbeafe; color: #1e40af; }
  .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  .footer { background: #f8fafc; padding: 20px 40px; text-align: center; color: #94a3b8; font-size: 12px; }
  .skill-tag { display: inline-block; padding: 3px 10px; background: #0D1B4B; color: #E8B84B; border-radius: 4px; font-size: 12px; margin: 2px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SKILL<span style="color:#fff">BRIDGE</span></h1>
      <span>PROFESSIONAL LEARNING PLATFORM</span>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} SkillBridge Technologies Pvt. Ltd. · Bangalore, India</p>
      <p>You're receiving this because you have an account on SkillBridge.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Email Templates ──────────────────────────────────────────────────────────

const templates = {
    welcome: ({ name }) => ({
        subject: '🎉 Welcome to SkillBridge — Your Learning Journey Begins!',
        html: htmlWrapper('Welcome to SkillBridge', `
            <h2>Welcome aboard, ${name}! 🚀</h2>
            <p>We're thrilled to have you join <strong>SkillBridge</strong> — the platform where ambition meets opportunity.</p>
            <p>Here's what you can do from day one:</p>
            <ul>
                <li>📚 Browse industry-relevant internship programs</li>
                <li>🎯 Complete structured tasks and build real projects</li>
                <li>🏆 Earn verified certificates to showcase on LinkedIn</li>
                <li>🤖 Generate an AI-powered resume from your achievements</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/internships" class="btn">Explore Internships →</a>
            <hr class="divider"/>
            <p style="font-size:13px; color:#94a3b8;">Need help? Reply to this email or reach us at support@skillbridge.io</p>
        `)
    }),

    submissionApproved: ({ name, taskTitle, internshipTitle, score, feedback }) => ({
        subject: `✅ Task Approved: "${taskTitle}"`,
        html: htmlWrapper('Submission Approved', `
            <span class="badge badge-success">✅ APPROVED</span>
            <h2>Great work, ${name}!</h2>
            <p>Your submission for <strong>"${taskTitle}"</strong> in <em>${internshipTitle}</em> has been <strong>approved</strong>.</p>
            ${score != null ? `<p><strong>Score:</strong> ${score}/100</p>` : ''}
            ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
            <p>Keep up the momentum — you're one step closer to your certificate!</p>
            <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">View Dashboard →</a>
        `)
    }),

    submissionRejected: ({ name, taskTitle, internshipTitle, feedback }) => ({
        subject: `🔄 Resubmission Needed: "${taskTitle}"`,
        html: htmlWrapper('Submission Needs Revision', `
            <span class="badge badge-danger">🔄 REVISION NEEDED</span>
            <h2>Hi ${name}, a small setback!</h2>
            <p>Your submission for <strong>"${taskTitle}"</strong> in <em>${internshipTitle}</em> requires some revisions.</p>
            ${feedback ? `<p><strong>Mentor's Feedback:</strong><br/><em>${feedback}</em></p>` : ''}
            <p>Don't be discouraged — revise and resubmit to move forward!</p>
            <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Revise & Resubmit →</a>
        `)
    }),

    certificateReady: ({ name, internshipTitle, certificateNumber, downloadUrl }) => ({
        subject: `🏆 Your SkillBridge Certificate is Ready!`,
        html: htmlWrapper('Certificate Ready', `
            <span class="badge badge-info">🏆 CERTIFICATE ISSUED</span>
            <h2>Congratulations, ${name}! 🎓</h2>
            <p>You've successfully completed <strong>"${internshipTitle}"</strong> and earned your SkillBridge certificate!</p>
            <p><strong>Certificate No:</strong> ${certificateNumber}</p>
            <p>Your certificate is ready to download and share on LinkedIn.</p>
            <a href="${downloadUrl || process.env.FRONTEND_URL + '/certificates'}" class="btn">Download Certificate →</a>
            <hr class="divider"/>
            <p style="font-size:13px; color:#94a3b8;">Verify at: ${process.env.FRONTEND_URL}/verify</p>
        `)
    }),

    enrollmentConfirmed: ({ name, internshipTitle, duration }) => ({
        subject: `📋 Enrolled: "${internshipTitle}"`,
        html: htmlWrapper('Enrollment Confirmed', `
            <span class="badge badge-info">📋 ENROLLED</span>
            <h2>You're in, ${name}!</h2>
            <p>Your enrollment in <strong>"${internshipTitle}"</strong> is confirmed.</p>
            ${duration ? `<p><strong>Duration:</strong> ${duration} Weeks</p>` : ''}
            <p>Head to your dashboard to start your learning journey.</p>
            <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Start Learning →</a>
        `)
    }),

    resumeReady: ({ name }) => ({
        subject: `📄 Your AI Resume is Ready — Download It Now`,
        html: htmlWrapper('Resume Ready', `
            <span class="badge badge-success">📄 RESUME GENERATED</span>
            <h2>Your AI resume is ready, ${name}!</h2>
            <p>SkillBridge AI has generated a professional resume from your internship achievements, skills, and project completions.</p>
            <a href="${process.env.FRONTEND_URL}/resume-builder" class="btn">View & Download Resume →</a>
        `)
    })
};

// ─── Send Email ───────────────────────────────────────────────────────────────
const sendEmail = async ({ to, templateName, templateData }) => {
    if (!isEmailConfigured()) {
        console.log(`[Email] Skipped (no credentials): ${templateName} → ${to}`);
        return { skipped: true };
    }
    try {
        const transporter = createTransporter();
        if (!transporter) {
            console.log(`[Email] Skipped (nodemailer unavailable): ${templateName} → ${to}`);
            return { skipped: true };
        }
        const { subject, html } = templates[templateName](templateData);
        const info = await transporter.sendMail({ from: FROM, to, subject, html });
        console.log(`[Email] Sent: ${subject} → ${to}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[Email] Failed: ${templateName} → ${to}`, err.message);
        return { success: false, error: err.message };
    }
};

module.exports = { sendEmail };
