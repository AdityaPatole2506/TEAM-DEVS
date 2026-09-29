import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/admin/stats
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, applicants, officials, admins, courses, applications] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'APPLICANT' } }),
      prisma.user.count({ where: { role: 'GOVERNMENT_OFFICIAL' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.course.count(),
      prisma.application.count(),
    ]);

    res.json({
      success: true,
      data: { totalUsers, applicants, officials, admins, courses, applications },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', role } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          applicantProfile: { select: { fullName: true, applicantId: true } },
          governmentOfficial: { select: { fullName: true, officialId: true, designation: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: { users, total } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

// PUT /api/admin/users/:id/toggle-active
router.put('/users/:id/toggle-active', async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true, role: true },
    });

    res.json({ success: true, data: updated, message: `User ${updated.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

export default router;
