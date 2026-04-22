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
import { setIO } from './services/cron'; // Fixed: no circular import

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/assignment_db';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Attach io to app for use in routes
app.set('socketio', io);

// Pass io to cron service (fixes circular dependency)
setIO(io);

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected');
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('❌ MongoDB error:', err));
