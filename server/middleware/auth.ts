import jwt from 'jsonwebtoken';

export const auth = (req: any, res: any, next: any) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

export const facultyOnly = (req: any, res: any, next: any) => {
    if (req.user.role !== 'Faculty') {
        return res.status(403).json({ error: 'Access denied. Faculty only.' });
    }
    next();
};
