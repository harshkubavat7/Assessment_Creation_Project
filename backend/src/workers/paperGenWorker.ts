import { Worker, Job } from 'bullmq';
import { connection } from '../queues/paperQueue';
import Assignment from '../models/Assignment';
import QuestionPaper from '../models/QuestionPaper';
import { generatePaper } from '../services/aiService';
import { broadcast } from '../ws/socketManager';

export function initWorker() {
  const worker = new Worker('paper-generation', async (job: Job) => {
    const { assignmentId } = job.data;
    console.log(`Worker processing job ${job.id} for assignment: ${assignmentId}`);

    try {
      // Step 1: Processing started
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
      broadcast({ type: 'job_progress', assignmentId, step: 'ai_generating', progress: 40 });

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error('Assignment not found');

      // Step 2: Call AI and parse response
      const sections = await generatePaper(assignment);

      broadcast({ type: 'job_progress', assignmentId, step: 'parsing', progress: 70 });

      // Step 3: Save to DB
      const paper = await QuestionPaper.create({ assignmentId, sections });

      await Assignment.findByIdAndUpdate(assignmentId, { status: 'done' });

      // Step 4: Done
      broadcast({ type: 'paper_ready', assignmentId, paperId: paper._id });
      console.log(`Worker completed job ${job.id} for assignment: ${assignmentId}`);

    } catch (err: any) {
      console.error(`Error processing job ${job.id}:`, err);
      throw err; // Trigger the failed handler
    }
  }, { connection });

  worker.on('failed', async (job, err) => {
    if (job) {
      console.error(`Job ${job.id} failed:`, err.message);
      await Assignment.findByIdAndUpdate(job.data.assignmentId, {
        status: 'error',
        errorMessage: err.message,
      });
      broadcast({ type: 'job_error', assignmentId: job.data.assignmentId, error: err.message });
    }
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });
}
