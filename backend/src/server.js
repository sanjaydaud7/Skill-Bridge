require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/database');
const { setIO } = require('./controllers/notificationController');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Socket.io setup (optional — server starts even if socket.io is unavailable)
try {
    const { Server } = require('socket.io');
    const io = new Server(server, {
        cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }
    });
    setIO(io);

    io.on('connection', (socket) => {
        console.log(`[Socket] Client connected: ${socket.id}`);

        socket.on('join', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`[Socket] User ${userId} joined room user_${userId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] Client disconnected: ${socket.id}`);
        });
    });

    console.log('[Socket] Socket.io initialized');
} catch (err) {
    console.warn('[Socket] socket.io not available, real-time notifications disabled:', err.message);
}

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
app.use('/api/internships', require('./routes/internship'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/tasks', require('./routes/task'));
app.use('/api/projects', require('./routes/project'));
app.use('/api/certificates', require('./routes/certificate'));
app.use('/api/payments', require('./routes/payment'));

// Admin Routes
app.use('/api/admin/internships', require('./routes/admin/internships'));
app.use('/api/admin/submissions', require('./routes/admin/submissions'));
app.use('/api/admin/enrollments', require('./routes/admin/enrollments'));
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/certificates', require('./routes/admin/certificates'));
app.use('/api/admin/payments', require('./routes/admin/payments'));
app.use('/api/admin/analytics', require('./routes/admin/analytics'));
app.use('/api/admin/resources', require('./routes/admin/resources'));

// Student resource access
app.use('/api/resources', require('./routes/resource'));

// New Feature Routes (wrapped in try/catch so one bad module can't stop the server)
try { app.use('/api/notifications', require('./routes/notification')); } catch (e) { console.warn('[Route] notifications failed:', e.message); }
try { app.use('/api/portfolio', require('./routes/portfolio')); } catch (e) { console.warn('[Route] portfolio failed:', e.message); }
try { app.use('/api/resume', require('./routes/resume')); } catch (e) { console.warn('[Route] resume failed:', e.message); }
try { app.use('/api/profile', require('./routes/profile')); } catch (e) { console.warn('[Route] profile failed:', e.message); }

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}\n`);
});

module.exports = app;