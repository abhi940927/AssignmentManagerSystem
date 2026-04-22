import express from 'express';
import { Assignment, Submission } from '../models/Assignment';
import { auth, facultyOnly } from '../middleware/auth';

const router = express.Router();

// POST /api/assignments — Faculty creates a new assignment
router.post('/', auth, facultyOnly, async (req: any, res: any) => {
    try {
        const { title, description, deadline, latePenalty } = req.body;

        if (!title || !description || !deadline) {
            return res.status(400).json({ error: 'Title, description and deadline are required' });
        }

        const assignment = new Assignment({
            title,
            description,
            deadline: new Date(deadline),
            latePenalty: latePenalty || 10,
            createdBy: req.user.id
        });

        await assignment.save();

        // Notify all connected students via Socket.io
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_assignment', {
                title,
                deadline,
                message: `📚 New assignment posted: "${title}"`
            });
        }

        res.status(201).json(assignment);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/assignments — All users can see assignments
router.get('/', auth, async (req: any, res: any) => {
    try {
        const assignments = await Assignment.find()
            .populate('createdBy', 'name')
            .sort({ deadline: 1 });
        res.json(assignments);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/assignments/analytics — MUST come before /:id route
router.get('/analytics', auth, facultyOnly, async (req: any, res: any) => {
    try {
        const assignments = await Assignment.find({ createdBy: req.user.id });

        const analytics = await Promise.all(assignments.map(async (a) => {
            const submissions = await Submission.find({ assignmentId: a._id });
            const onTime = submissions.filter(s => s.status === 'On-time').length;
            const late = submissions.filter(s => s.status === 'Late').length;
            const pending = 0; // Could calculate enrolled students - submitted

            return {
                _id: a._id,
                title: a.title,
                deadline: a.deadline,
                totalSubmissions: submissions.length,
                onTime,
                late,
                pending
            };
        }));

        res.json(analytics);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/assignments/:id — Get single assignment
router.get('/:id', auth, async (req: any, res: any) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('createdBy', 'name');
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
        res.json(assignment);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/assignments/:id — Faculty deletes an assignment
router.delete('/:id', auth, facultyOnly, async (req: any, res: any) => {
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Assignment deleted' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
