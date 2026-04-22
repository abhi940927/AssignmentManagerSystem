import cron from 'node-cron';
import { Assignment } from '../models/Assignment';

let io: any = null;

export const setIO = (socketIO: any) => {
    io = socketIO;
};

// Run every hour - check for assignments due within 24 hours
cron.schedule('0 * * * *', async () => {
    try {
        if (mongoose.connection.readyState < 1) {
            console.log('Cron: DB not connected, skipping check...');
            return;
        }

        console.log('Running deadline reminder cron job...');
        const oneDayFromNow = new Date();
        oneDayFromNow.setHours(oneDayFromNow.getHours() + 24);

        const approachingAssignments = await Assignment.find({
            deadline: {
                $gt: new Date(),
                $lt: oneDayFromNow
            }
        });

        for (const assignment of approachingAssignments) {
            if (io) {
                io.emit('deadline_alert', {
                    title: assignment.title,
                    deadline: assignment.deadline,
                    message: `⏰ Reminder: "${assignment.title}" is due within 24 hours!`
                });
            }
        }

        console.log(`Checked ${approachingAssignments.length} approaching assignments.`);
    } catch (err) {
        console.error('Cron job error:', err);
    }
});
