import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Submission, Assignment } from '../models/Assignment';
import { auth, facultyOnly } from '../middleware/auth';

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf',
                         'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and Word documents are allowed'));
        }
    }
});

// POST /api/submissions/:assignmentId — Student submits a file
router.post('/:assignmentId', auth, upload.single('file'), async (req: any, res: any) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { assignmentId } = req.params;
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

        // Check if student already submitted
        const existing = await Submission.findOne({ assignmentId, studentId: req.user.id });
        if (existing) {
            return res.status(400).json({ error: 'You have already submitted this assignment' });
        }

        const isLate = new Date() > new Date(assignment.deadline);
        const status = isLate ? 'Late' : 'On-time';

        const submission = new Submission({
            assignmentId,
            studentId: req.user.id,
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            status
        });

        await submission.save();

        // Notify faculty via socket
        const io = req.app.get('socketio');
        if (io) {
            io.to(assignment.createdBy.toString()).emit('new_submission', {
                studentName: req.user.name,
                assignmentTitle: assignment.title
            });
        }

        res.status(201).json(submission);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/submissions/my-submissions — Student views their own submissions
router.get('/my-submissions', auth, async (req: any, res: any) => {
    try {
        const submissions = await Submission.find({ studentId: req.user.id })
            .populate('assignmentId', 'title deadline')
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/submissions/assignment/:assignmentId — Faculty views all submissions for an assignment
router.get('/assignment/:assignmentId', auth, facultyOnly, async (req: any, res: any) => {
    try {
        const submissions = await Submission.find({ assignmentId: req.params.assignmentId })
            .populate('studentId', 'name email dob')
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/submissions/:submissionId/remarks — Faculty adds remarks
router.patch('/:submissionId/remarks', auth, facultyOnly, async (req: any, res: any) => {
    try {
        const { remarks } = req.body;
        if (!remarks) return res.status(400).json({ error: 'Remarks cannot be empty' });

        const submission = await Submission.findByIdAndUpdate(
            req.params.submissionId,
            { remarks },
            { new: true }
        );

        if (!submission) return res.status(404).json({ error: 'Submission not found' });

        // Notify student via socket
        const io = req.app.get('socketio');
        if (io) {
            io.to(submission.studentId.toString()).emit('new_remark', {
                submissionId: submission._id,
                remarks
            });
        }

        res.json(submission);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
