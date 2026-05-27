import { Router, Response } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import Assignment from '../models/Assignment';
import QuestionPaper from '../models/QuestionPaper';
import Group from '../models/Group';
import { paperQueue } from '../queues/paperQueue';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Configure multer for in-memory file handling, maximum 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Enforce authentication middleware on all assignment routes
router.use(authMiddleware);

// Create Assignment
router.post('/assignments', upload.single('file'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    let body;
    try {
      body = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    } catch {
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

    // 3. Validate Marks Configuration (Dynamic Array)
    const marksConfigList = body.marksConfig;
    if (!Array.isArray(marksConfigList)) {
      return res.status(400).json({ error: 'marksConfig must be an array.' });
    }

    let calculatedTotal = 0;
    for (const item of marksConfigList) {
      if (item.count < 0) {
        return res.status(400).json({ error: 'Question counts cannot be negative.' });
      }
      if (item.count > 0 && item.marks < 1) {
        return res.status(400).json({ error: 'Marks per question must be at least 1 when count is greater than 0.' });
      }
      if (body.questionTypes.includes(item.type)) {
        calculatedTotal += Number(item.count) * Number(item.marks);
      }
    }

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
          const parsed = await pdfParse(req.file.buffer);
          referenceText = parsed.text || '';
        } catch (pdfErr: any) {
          console.error('PDF parsing error:', pdfErr);
          return res.status(400).json({ error: 'Failed to parse PDF document. It might be corrupt.' });
        }
      } else if (req.file.mimetype === 'text/plain' || req.file.originalname.endsWith('.txt')) {
        referenceText = req.file.buffer.toString('utf-8');
      } else {
        // Fallback for DOCX or other formats: convert printable characters
        referenceText = req.file.buffer.toString('utf-8').replace(/[^\x20-\x7E\t\r\n]/g, '');
      }
    }

    // 6. Save and Enqueue Job
    const assignment = await Assignment.create({
      subject: body.subject,
      grade: body.grade,
      topic: body.topic || 'General Topic',
      dueDate: dueDateObj,
      totalMarks: Number(body.totalMarks),
      questionTypes: body.questionTypes,
      marksConfig: body.marksConfig,
      difficulty: { easy, medium, hard },
      instructions: body.instructions || '',
      referenceText,
      status: 'pending',
      userId: req.userId // Link assignment to teacher
    });

    // Add to queue
    try {
      await paperQueue.add('generate', { assignmentId: assignment._id.toString() });
    } catch (queueErr: any) {
      console.error('Failed to add job to Redis queue:', queueErr);
      await Assignment.findByIdAndDelete(assignment._id);
      return res.status(503).json({ error: 'Queue service is currently unavailable. Please verify Redis is running.' });
    }

    res.status(201).json({ assignmentId: assignment._id });
  } catch (err: any) {
    console.error('Assignment route error:', err);
    res.status(500).json({ error: 'An unexpected internal server error occurred.' });
  }
});

// Get all assignments for current teacher
router.get('/assignments', async (req: AuthenticatedRequest, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get assignment status
router.get('/assignments/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.userId });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get generated paper
router.get('/assignments/:id/paper', async (req: AuthenticatedRequest, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.userId });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    const paper = await QuestionPaper.findOne({ assignmentId: req.params.id });
    if (!paper) {
      return res.status(404).json({ error: 'Question paper has not been generated yet.' });
    }
    res.json(paper);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Regenerate paper
router.post('/assignments/:id/regenerate', async (req: AuthenticatedRequest, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.userId });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    await Assignment.findByIdAndUpdate(req.params.id, { status: 'pending', errorMessage: undefined });
    await QuestionPaper.deleteOne({ assignmentId: req.params.id });
    
    try {
      await paperQueue.add('generate', { assignmentId: req.params.id });
    } catch (queueErr) {
      console.error('Failed to add job to Redis queue during regeneration:', queueErr);
      return res.status(503).json({ error: 'Queue service is currently unavailable. Please verify Redis is running.' });
    }

    res.json({ message: 'Regeneration queued' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Delete assignment
router.delete('/assignments/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const assignment = await Assignment.findOne({ _id: req.params.id, userId: req.userId });
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    await QuestionPaper.deleteOne({ assignmentId: req.params.id });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get dashboard stats & recent activity
router.get('/dashboard/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalAssignments = await Assignment.countDocuments({ userId: req.userId });
    const activeGroups = await Group.countDocuments({ userId: req.userId });
    const pendingGenerations = await Assignment.countDocuments({ userId: req.userId, status: { $in: ['pending', 'processing'] } });
    
    // AI Credits used: 50 credits per assignment
    const aiCreditsUsed = totalAssignments * 50;

    // Build recent activities dynamically
    const recentAssignments = await Assignment.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(3);
    
    const recentGroups = await Group.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(2);

    const activities: Array<{ text: string; time: string; type: string }> = [];

    // Helper to format relative time
    const getRelativeTime = (date: any) => {
      const diffMs = Date.now() - new Date(date).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} mins ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      return new Date(date).toLocaleDateString('en-GB');
    };

    for (const group of recentGroups) {
      activities.push({
        text: `Student group '${group.name}' successfully registered.`,
        time: getRelativeTime(group.createdAt),
        type: 'success'
      });
    }

    for (const assign of recentAssignments) {
      let text = `Quiz on '${assign.topic || assign.subject}' is ${assign.status}.`;
      let type = 'info';
      if (assign.status === 'done') {
        text = `Quiz on '${assign.topic || assign.subject}' successfully generated.`;
        type = 'success';
      } else if (assign.status === 'error') {
        text = `Quiz on '${assign.topic || assign.subject}' generation failed.`;
        type = 'warning';
      } else if (assign.status === 'processing') {
        text = `Quiz on '${assign.topic || assign.subject}' is currently generating.`;
        type = 'info';
      }

      activities.push({
        text,
        time: getRelativeTime(assign.createdAt),
        type
      });
    }

    // Sort activities by time
    if (activities.length === 0) {
      activities.push({
        text: "Welcome to VedaAI! Create your first student group or assignment to get started.",
        time: "Just now",
        type: "info"
      });
    }

    res.json({
      stats: {
        totalAssignments,
        activeGroups,
        pendingGenerations,
        aiCreditsUsed
      },
      activities
    });
  } catch (err: any) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
