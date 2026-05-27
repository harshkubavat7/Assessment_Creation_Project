import { Router, Response } from 'express';
import Group from '../models/Group';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Enforce authentication middleware on all group routes
router.use(authMiddleware);

// Create a new group
router.post('/groups', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, students, department, average } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Group name is required.' });
    }
    if (!department || typeof department !== 'string' || department.trim().length === 0) {
      return res.status(400).json({ error: 'Department is required.' });
    }

    const group = await Group.create({
      name: name.trim(),
      students: Number(students) || 0,
      department: department.trim(),
      average: average || 'N/A',
      userId: req.userId
    });

    res.status(201).json(group);
  } catch (err: any) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Failed to create student group.' });
  }
});

// Get all groups for current teacher
router.get('/groups', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const groups = await Group.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(groups);
  } catch (err: any) {
    console.error('Get groups error:', err);
    res.status(500).json({ error: 'Failed to fetch student groups.' });
  }
});

// Delete a group
router.delete('/groups/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, userId: req.userId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: 'Group deleted successfully.' });
  } catch (err: any) {
    console.error('Delete group error:', err);
    res.status(500).json({ error: 'Failed to delete student group.' });
  }
});

export default router;
