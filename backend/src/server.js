require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// Body parser middleware
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SkillBridge Backend API',
        timestamp: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/course'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/tasks', require('./routes/task'));
app.use('/api/projects', require('./routes/project'));
app.use('/api/certificates', require('./routes/certificate'));
app.use('/api/payments', require('./routes/payment'));

// Admin Routes
app.use('/api/admin/courses', require('./routes/admin/courses'));
app.use('/api/admin/submissions', require('./routes/admin/submissions'));
app.use('/api/admin/enrollments', require('./routes/admin/enrollments'));
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/certificates', require('./routes/admin/certificates'));
app.use('/api/admin/payments', require('./routes/admin/payments'));
app.use('/api/admin/analytics', require('./routes/admin/analytics'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}\n`);
});

module.exports = app;