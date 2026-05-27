"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWorker = initWorker;
const bullmq_1 = require("bullmq");
const paperQueue_1 = require("../queues/paperQueue");
const Assignment_1 = __importDefault(require("../models/Assignment"));
const QuestionPaper_1 = __importDefault(require("../models/QuestionPaper"));
const aiService_1 = require("../services/aiService");
const socketManager_1 = require("../ws/socketManager");
function initWorker() {
    const worker = new bullmq_1.Worker('paper-generation', async (job) => {
        const { assignmentId } = job.data;
        console.log(`Worker processing job ${job.id} for assignment: ${assignmentId}`);
        try {
            // Step 1: Processing started
            await Assignment_1.default.findByIdAndUpdate(assignmentId, { status: 'processing' });
            (0, socketManager_1.broadcast)({ type: 'job_progress', assignmentId, step: 'ai_generating', progress: 40 });
            const assignment = await Assignment_1.default.findById(assignmentId);
            if (!assignment)
                throw new Error('Assignment not found');
            // Step 2: Call AI and parse response
            const sections = await (0, aiService_1.generatePaper)(assignment);
            (0, socketManager_1.broadcast)({ type: 'job_progress', assignmentId, step: 'parsing', progress: 70 });
            // Step 3: Save to DB
            const paper = await QuestionPaper_1.default.create({ assignmentId, sections });
            await Assignment_1.default.findByIdAndUpdate(assignmentId, { status: 'done' });
            // Step 4: Done
            (0, socketManager_1.broadcast)({ type: 'paper_ready', assignmentId, paperId: paper._id });
            console.log(`Worker completed job ${job.id} for assignment: ${assignmentId}`);
        }
        catch (err) {
            console.error(`Error processing job ${job.id}:`, err);
            throw err; // Trigger the failed handler
        }
    }, { connection: paperQueue_1.connection });
    worker.on('failed', async (job, err) => {
        if (job) {
            console.error(`Job ${job.id} failed:`, err.message);
            await Assignment_1.default.findByIdAndUpdate(job.data.assignmentId, {
                status: 'error',
                errorMessage: err.message,
            });
            (0, socketManager_1.broadcast)({ type: 'job_error', assignmentId: job.data.assignmentId, error: err.message });
        }
    });
    worker.on('error', (err) => {
        console.error('Worker error:', err);
    });
}
