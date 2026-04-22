import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import authRoutes from './routes/auth';
import assignmentRoutes from './routes/assignments';
import submissionRoutes from './routes/submissions';
import { setIO } from './services/cron';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io defensively
let io: any;
try {
    io = new Server(httpServer, {
        cors: { origin: '*' }
    });
    
    io.on('connection', (socket: any) => {
        socket.on('join', (userId: string) => socket.join(userId));
    });

    app.set('socketio', io);
    setIO(io);
} catch (err) {
    console.error('Socket initialization warning:', err);
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/assignment_db';

// DB Connection Utility
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (err: any) {
        console.error('❌ MongoDB Connection Error:', err.message);
    }
};

// Middleware
app.use(cors());
app.use(express.json());

// Ensure DB connection for every API request
app.use('/api', async (req, res, next) => {
    await connectDB();
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        env: process.env.NODE_ENV
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Local development listener
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 8080;
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel
export default app;
