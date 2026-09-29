import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();
router.use(authenticate);
router.use(authorize('APPLICANT'));

// GET /api/applicant/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.applicantProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        applications: { orderBy: { submittedAt: 'desc' }, take: 1 },
        enrollments: { include: { course: true }, take: 1 },
        verifications: true,
        gapAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { applications: true, enrollments: true, gapAnalyses: true } },
      },
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const unreadNotifications = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false },
    });

    res.json({
      success: true,
      data: {
        profile,
        stats: {
          profileCompletion: profile.profileCompletion,
          applicationStatus: profile.applications[0]?.status || 'NONE',
          courseEnrolled: profile.enrollments[0]?.course?.name || 'None',
          verificationStatus: profile.verificationStatus,
          gapAnalysisCount: profile._count.gapAnalyses,
          totalApplications: profile._count.applications,
          totalEnrollments: profile._count.enrollments,
          unreadNotifications,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/applicant/profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.applicantProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        education: true,
        applicantSkills: { include: { skill: true } },
        verifications: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { email: true, createdAt: true },
    });

    res.json({ success: true, data: { ...profile, email: user?.email } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// PUT /api/applicant/profile
router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, dob, gender, mobile, alternateMobile, location, currentAddress, permanentAddress, education, skills } = req.body;

    const profile = await prisma.applicantProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    // Calculate completion
    let completion = 20;
    if (fullName) completion += 10;
    if (dob) completion += 5;
    if (gender) completion += 5;
    if (mobile) completion += 10;
    if (location) completion += 5;
    if (currentAddress) completion += 5;
    if (permanentAddress) completion += 5;
    if (profile.maskedAadhaar) completion += 10;
    if (profile.biometricVerified) completion += 15;
    if (education?.length > 0) completion += 10;

    const updatedProfile = await prisma.applicantProfile.update({
      where: { userId: req.user!.id },
      data: {
        fullName: fullName || profile.fullName,
        dob: dob ? new Date(dob) : profile.dob,
        gender: gender || profile.gender,
        mobile: mobile || profile.mobile,
        alternateMobile: alternateMobile || profile.alternateMobile,
        location: location || profile.location,
        currentAddress: currentAddress || profile.currentAddress,
        permanentAddress: permanentAddress || profile.permanentAddress,
        profileCompletion: Math.min(completion, 100),
      },
      include: { education: true, applicantSkills: { include: { skill: true } } },
    });

    // Update education if provided
    if (education && Array.isArray(education)) {
      await prisma.education.deleteMany({ where: { applicantId: profile.id } });
      if (education.length > 0) {
        await prisma.education.createMany({
          data: education.map((edu: any) => ({
            applicantId: profile.id,
            qualification: edu.qualification,
            institution: edu.institution,
            course: edu.course,
            specialization: edu.specialization || null,
            graduationYear: edu.graduationYear ? parseInt(edu.graduationYear) : null,
          })),
        });
      }
    }

    res.json({ success: true, data: updatedProfile, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// GET /api/applicant/applications
router.get('/applications', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.applicantProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    const applications = await prisma.application.findMany({
      where: { applicantId: profile.id },
      include: { statusHistory: { orderBy: { updatedAt: 'asc' } } },
      orderBy: { submittedAt: 'desc' },
    });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

// GET /api/applicant/enrollments
router.get('/enrollments', async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.applicantProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });

    const enrollments = await prisma.enrollment.findMany({
      where: { applicantId: profile.id },
      include: { course: { include: { courseSkills: { include: { skill: true } } } } },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json({ success: true, data: enrollments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch enrollments' });
  }
});

// GET /api/applicant/notifications
router.get('/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// PUT /api/applicant/notifications/:id/read
router.put('/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update notification' });
  }
});

export default router;
