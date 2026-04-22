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

// Defensive Socket.io initialization for Vercel
let io: any;
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL) {
    try {
        io = new Server(httpServer, {
            cors: { origin: '*' }
        });
        
        io.on('connection', (socket: any) => {
            console.log('User connected:', socket.id);
            socket.on('join', (userId: string) => {
                socket.join(userId);
            });
            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });

        app.set('socketio', io);
        setIO(io);
    } catch (err) {
        console.error('Socket.io initialization skipped or failed:', err);
    }
}

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/assignment_db';

// DB Connection Utility
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        if (!MONGO_URI) throw new Error('MONGO_URI is not defined');
        await mongoose.connect(MONGO_URI);
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        throw err; // Rethrow to catch in middleware
    }
};

// Middleware
app.use(cors());
app.use(express.json());

// Ensure DB is connected for every request (crucial for Vercel)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err: any) {
        console.error('Database middleware error:', err.message);
        // If DB fails, we still let the request through but routes will fail gracefully
        next();
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

// Start server locally
if (process.env.NODE_ENV !== 'production') {
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel
export default app;
