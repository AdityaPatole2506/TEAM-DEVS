import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateToken, authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, mobile, dob, gender, location, currentAddress, permanentAddress, maskedAadhaar, alternateMobile } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: 'Email, password and full name are required' });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const applicantId = `APP${Date.now().toString().slice(-6)}`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'APPLICANT',
        applicantProfile: {
          create: {
            applicantId,
            fullName,
            mobile: mobile || null,
            alternateMobile: alternateMobile || null,
            dob: dob ? new Date(dob) : null,
            gender: gender || null,
            location: location || null,
            currentAddress: currentAddress || null,
            permanentAddress: permanentAddress || null,
            maskedAadhaar: maskedAadhaar || null,
            profileCompletion: 40,
          },
        },
        notifications: {
          create: {
            title: 'Welcome to MH Gov Portal!',
            message: `Welcome ${fullName}! Your account has been created successfully. Please complete your profile.`,
            type: 'SUCCESS',
          },
        },
      },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      data: { user, token },
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        applicantProfile: { select: { fullName: true, applicantId: true } },
        governmentOfficial: { select: { fullName: true, officialId: true, designation: true } },
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, error: 'Account is deactivated. Please contact support.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        resource: 'auth',
        details: `User logged in from ${req.ip}`,
        ipAddress: req.ip,
      },
    }).catch(() => {});

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      profile: user.applicantProfile || user.governmentOfficial,
    };

    res.json({ success: true, data: { user: safeUser, token }, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'LOGOUT',
          resource: 'auth',
          details: 'User logged out',
          ipAddress: req.ip,
        },
      }).catch(() => {});
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.json({ success: true, message: 'Logged out' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        applicantProfile: {
          select: { fullName: true, applicantId: true, profileCompletion: true },
        },
        governmentOfficial: {
          select: { fullName: true, officialId: true, designation: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
});

export default router;
