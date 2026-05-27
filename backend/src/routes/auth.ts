import { Router, Request, Response } from 'express';
import User from '../models/User';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Endpoint: signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, schoolName, schoolLocation } = req.body;

    // 1. Basic validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (!schoolName || typeof schoolName !== 'string' || schoolName.trim().length === 0) {
      return res.status(400).json({ error: 'School name is required.' });
    }
    if (!schoolLocation || typeof schoolLocation !== 'string' || schoolLocation.trim().length === 0) {
      return res.status(400).json({ error: 'School city/location is required.' });
    }

    // 2. Check duplicate email (case-insensitive query)
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // 3. Hash password and save
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      schoolName: schoolName.trim(),
      schoolLocation: schoolLocation.trim()
    });

    // 4. Set session token cookie
    const token = generateToken({ userId: user._id.toString() });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Account created successfully.',
      user: {
        email: user.email,
        schoolName: user.schoolName,
        schoolLocation: user.schoolLocation
      }
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'An unexpected internal error occurred during signup.' });
  }
});

// Endpoint: login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password hash
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Set token cookie
    const token = generateToken({ userId: user._id.toString() });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Logged in successfully.',
      user: {
        email: user.email,
        schoolName: user.schoolName,
        schoolLocation: user.schoolLocation
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An unexpected internal error occurred during login.' });
  }
});

// Endpoint: logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out successfully.' });
});

// Endpoint: get user profile
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    res.json({
      email: user.email,
      schoolName: user.schoolName,
      schoolLocation: user.schoolLocation
    });
  } catch (err: any) {
    console.error('Me query error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
