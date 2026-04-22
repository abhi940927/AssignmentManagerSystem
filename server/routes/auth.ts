import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const router = express.Router();

router.post('/register', async (req: any, res: any) => {
    try {
        const { name, email, password, dob, role } = req.body;
        console.log('Registration attempt:', { name, email, dob, role });

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userDob = new Date(dob);
        if (isNaN(userDob.getTime())) {
            return res.status(400).json({ error: 'Invalid date of birth' });
        }

        const user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            dob: userDob,
            role 
        });
        
        await user.save();
        console.log('User registered successfully');
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err: any) {
        console.error('Registration error detail:', err);
        res.status(400).json({ error: err.message || 'Registration failed' });
    }
});

router.post('/login', async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '24h' }
        );
        res.json({ token, role: user.role, name: user.name, id: user._id });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
