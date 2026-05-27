"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const Assignment_1 = __importDefault(require("../models/Assignment"));
const QuestionPaper_1 = __importDefault(require("../models/QuestionPaper"));
const paperQueue_1 = require("../queues/paperQueue");
const router = (0, express_1.Router)();
// Configure multer for in-memory file handling, maximum 10MB
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});
router.post('/assignments', upload.single('file'), async (req, res) => {
    try {
        let body;
        try {
            body = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
        }
        catch {
            body = req.body;
        }
        // 1. Validate required fields
        if (!body.subject || typeof body.subject !== 'string' || body.subject.trim().length < 2) {
            return res.status(400).json({ error: 'Subject is required and must be at least 2 characters.' });
        }
        if (!body.grade || typeof body.grade !== 'string') {
            return res.status(400).json({ error: 'Grade is required.' });
        }
        if (!body.dueDate) {
            return res.status(400).json({ error: 'Due date is required.' });
        }
        const dueDateObj = new Date(body.dueDate);
        if (isNaN(dueDateObj.getTime()) || dueDateObj < new Date()) {
            return res.status(400).json({ error: 'Due date must be a valid future date.' });
        }
        if (!body.totalMarks || isNaN(Number(body.totalMarks)) || Number(body.totalMarks) <= 0) {
            return res.status(400).json({ error: 'Total marks must be a positive integer.' });
        }
        // 2. Validate Question Types
        if (!body.questionTypes || !Array.isArray(body.questionTypes) || body.questionTypes.length === 0) {
            return res.status(400).json({ error: 'At least one question type must be selected.' });
        }
        // 3. Validate Marks Configuration
        const mcq = body.marksConfig?.mcq || { count: 0, marks: 0 };
        const short = body.marksConfig?.short || { count: 0, marks: 0 };
        const long = body.marksConfig?.long || { count: 0, marks: 0 };
        if (mcq.count < 0 || short.count < 0 || long.count < 0) {
            return res.status(400).json({ error: 'Question counts cannot be negative.' });
        }
        if ((mcq.count > 0 && mcq.marks < 1) || (short.count > 0 && short.marks < 1) || (long.count > 0 && long.marks < 1)) {
            return res.status(400).json({ error: 'Marks per question must be at least 1 when count is greater than 0.' });
        }
        // Calculate marks total match
        const calculatedTotal = (mcq.count * mcq.marks) + (short.count * short.marks) + (long.count * long.marks);
        if (calculatedTotal !== Number(body.totalMarks)) {
            return res.status(400).json({ error: `Sum of allocated marks (${calculatedTotal}) does not match the total marks (${body.totalMarks}).` });
        }
        // 4. Validate Difficulty percentages
        const easy = Number(body.difficulty?.easy || 0);
        const medium = Number(body.difficulty?.medium || 0);
        const hard = Number(body.difficulty?.hard || 0);
        if (easy + medium + hard !== 100) {
            return res.status(400).json({ error: 'Difficulty percentages (Easy + Medium + Hard) must sum exactly to 100%.' });
        }
        // 5. File Processing
        let referenceText = '';
        if (req.file) {
            const allowedExtensions = /\.(pdf|txt|docx)$/i;
            if (!allowedExtensions.test(req.file.originalname)) {
                return res.status(400).json({ error: 'Invalid file type. Only PDF, TXT, and DOCX are allowed.' });
            }
            if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
                try {
                    const parsed = await (0, pdf_parse_1.default)(req.file.buffer);
                    referenceText = parsed.text || '';
                }
                catch (pdfErr) {
                    console.error('PDF parsing error:', pdfErr);
                    return res.status(400).json({ error: 'Failed to parse PDF document. It might be corrupt.' });
                }
            }
            else if (req.file.mimetype === 'text/plain' || req.file.originalname.endsWith('.txt')) {
                referenceText = req.file.buffer.toString('utf-8');
            }
            else {
                // Fallback for DOCX or other formats: convert printable characters
                referenceText = req.file.buffer.toString('utf-8').replace(/[^\x20-\x7E\t\r\n]/g, '');
            }
        }
        // 6. Save and Enqueue Job
        const assignment = await Assignment_1.default.create({
            subject: body.subject,
            grade: body.grade,
            topic: body.topic || 'General Topic',
            dueDate: dueDateObj,
            totalMarks: Number(body.totalMarks),
            questionTypes: body.questionTypes,
            marksConfig: {
                mcq: { count: Number(mcq.count), marks: Number(mcq.marks) },
                short: { count: Number(short.count), marks: Number(short.marks) },
                long: { count: Number(long.count), marks: Number(long.marks) }
            },
            difficulty: { easy, medium, hard },
            instructions: body.instructions || '',
            referenceText,
            status: 'pending'
        });
        // Add to queue
        try {
            await paperQueue_1.paperQueue.add('generate', { assignmentId: assignment._id.toString() });
        }
        catch (queueErr) {
            console.error('Failed to add job to Redis queue:', queueErr);
            await Assignment_1.default.findByIdAndDelete(assignment._id);
            return res.status(503).json({ error: 'Queue service is currently unavailable. Please verify Redis is running.' });
        }
        res.status(201).json({ assignmentId: assignment._id });
    }
    catch (err) {
        console.error('Assignment route error:', err);
        res.status(500).json({ error: 'An unexpected internal server error occurred.' });
    }
});
// Get assignment status
router.get('/assignments/:id', async (req, res) => {
    try {
        const assignment = await Assignment_1.default.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found.' });
        }
        res.json(assignment);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});
// Get generated paper
router.get('/assignments/:id/paper', async (req, res) => {
    try {
        const paper = await QuestionPaper_1.default.findOne({ assignmentId: req.params.id });
        if (!paper) {
            return res.status(404).json({ error: 'Question paper has not been generated yet.' });
        }
        res.json(paper);
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});
// Regenerate paper
router.post('/assignments/:id/regenerate', async (req, res) => {
    try {
        const assignment = await Assignment_1.default.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found.' });
        }
        await Assignment_1.default.findByIdAndUpdate(req.params.id, { status: 'pending', errorMessage: undefined });
        await QuestionPaper_1.default.deleteOne({ assignmentId: req.params.id });
        try {
            await paperQueue_1.paperQueue.add('generate', { assignmentId: req.params.id });
        }
        catch (queueErr) {
            console.error('Failed to add job to Redis queue during regeneration:', queueErr);
            return res.status(503).json({ error: 'Queue service is currently unavailable. Please verify Redis is running.' });
        }
        res.json({ message: 'Regeneration queued' });
    }
    catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});
exports.default = router;
