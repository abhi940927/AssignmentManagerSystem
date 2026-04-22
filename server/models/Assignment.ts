import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    deadline: { type: Date, required: true },
    latePenalty: { type: Number, default: 10 }, // % deduction per day or flat
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Assignment = mongoose.model('Assignment', assignmentSchema);

const submissionSchema = new mongoose.Schema({
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['On-time', 'Late'], required: true },
    remarks: { type: String, default: '' },
    penaltyApplied: { type: Number, default: 0 }
}, { timestamps: true });

export const Submission = mongoose.model('Submission', submissionSchema);
