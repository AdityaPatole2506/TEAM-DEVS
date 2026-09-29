import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();
router.use(authenticate);
router.use(authorize('GOVERNMENT_OFFICIAL', 'ADMIN'));

// GET /api/official/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalApplicants,
      activeApplications,
      pendingVerification,
      completedApplications,
      enrolledApplicants,
      gapAnalyses,
    ] = await Promise.all([
      prisma.applicantProfile.count(),
      prisma.application.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_VERIFIED', 'ELIGIBILITY_CHECKED'] } } }),
      prisma.applicantProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.enrollment.count({ where: { status: 'ENROLLED' } }),
      prisma.gapAnalysis.count(),
    ]);

    const recentApplicants = await prisma.applicantProfile.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        applications: { take: 1, orderBy: { submittedAt: 'desc' } },
      },
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalApplicants,
          activeApplications,
          pendingVerification,
          completedApplications,
          enrolledApplicants,
          skillGapsDetected: gapAnalyses * 6, // approximate
        },
        recentApplicants,
      },
    });
  } catch (error) {
    console.error('Official dashboard error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/official/applicants
router.get('/applicants', async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { applicantId: { contains: search } },
        { mobile: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }
    if (status) where.verificationStatus = status;

    const [applicants, total] = await Promise.all([
      prisma.applicantProfile.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: { select: { email: true, createdAt: true } },
          applications: { take: 1, orderBy: { submittedAt: 'desc' } },
          enrollments: { take: 1, include: { course: { select: { name: true } } } },
          tracker: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.applicantProfile.count({ where }),
    ]);

    res.json({ success: true, data: { applicants, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch applicants' });
  }
});

// GET /api/official/applicants/:id
router.get('/applicants/:id', async (req: AuthRequest, res: Response) => {
  try {
    const applicant = await prisma.applicantProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { email: true, createdAt: true } },
        education: true,
        applicantSkills: { include: { skill: true } },
        enrollments: { include: { course: true } },
        applications: { include: { statusHistory: { orderBy: { updatedAt: 'asc' } } }, orderBy: { submittedAt: 'desc' } },
        verifications: true,
        tracker: true,
        gapAnalyses: { include: { skillGaps: true }, orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!applicant) return res.status(404).json({ success: false, error: 'Applicant not found' });

    res.json({ success: true, data: applicant });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch applicant' });
  }
});

// GET /api/official/trackers
router.get('/trackers', async (req: AuthRequest, res: Response) => {
  try {
    const { search, epfoStatus, taxGstStatus, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (epfoStatus) where.epfoStatus = epfoStatus;
    if (taxGstStatus) where.taxGstStatus = taxGstStatus;

    const [trackers, total] = await Promise.all([
      prisma.tracker.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          applicant: {
            include: {
              user: { select: { email: true } },
              applications: { take: 1, orderBy: { submittedAt: 'desc' } },
            },
          },
        },
        orderBy: { lastUpdated: 'desc' },
      }),
      prisma.tracker.count({ where }),
    ]);

    res.json({ success: true, data: { trackers, total } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch trackers' });
  }
});

// PUT /api/official/trackers/:id
router.put('/trackers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { designation, governmentId, epfoStatus, taxGstStatus, credentialStatus, notes } = req.body;

    const tracker = await prisma.tracker.update({
      where: { id: req.params.id },
      data: {
        designation: designation || undefined,
        governmentId: governmentId || undefined,
        epfoStatus: epfoStatus || undefined,
        taxGstStatus: taxGstStatus || undefined,
        credentialStatus: credentialStatus || undefined,
        notes: notes || undefined,
        lastUpdated: new Date(),
        updatedBy: req.user!.email,
      },
    });

    res.json({ success: true, data: tracker, message: 'Tracker updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update tracker' });
  }
});

// GET /api/official/applications
router.get('/applications', async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '20', search } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          applicant: {
            include: { user: { select: { email: true } } },
          },
          statusHistory: { orderBy: { updatedAt: 'asc' } },
        },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.application.count({ where }),
    ]);

    res.json({ success: true, data: { applications, total } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch applications' });
  }
});

// PUT /api/official/applications/:id/status
router.put('/applications/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status, remarks } = req.body;
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status,
        remarks: remarks || undefined,
        statusHistory: {
          create: {
            status,
            remarks: remarks || `Status updated to ${status}`,
            updatedBy: req.user!.email,
          },
        },
      },
      include: {
        applicant: { include: { user: true } },
      },
    });

    if (application.applicant?.user) {
      await prisma.notification.create({
        data: {
          userId: application.applicant.user.id,
          title: `Application Status: ${status.replace(/_/g, ' ')}`,
          message: `Your application (${application.applicationId}) status has been updated to "${status.replace(/_/g, ' ')}". Remarks: ${remarks || 'None'}`,
          type: status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'WARNING' : 'INFO',
        },
      }).catch(() => {});
    }

    res.json({ success: true, data: application, message: 'Application status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update application status' });
  }
});

// GET /api/official/verifications
router.get('/verifications', async (req: AuthRequest, res: Response) => {
  try {
    const { status, type } = req.query as Record<string, string>;
    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const verifications = await prisma.verification.findMany({
      where,
      include: {
        applicant: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: verifications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch verifications' });
  }
});

// PUT /api/official/verifications/:id/status
router.put('/verifications/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status, remarks } = req.body;
    const verification = await prisma.verification.update({
      where: { id: req.params.id },
      data: {
        status,
        remarks: remarks || undefined,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
      },
      include: {
        applicant: { include: { user: true } },
      },
    });

    if (status === 'VERIFIED') {
      const allVerifications = await prisma.verification.findMany({
        where: { applicantId: verification.applicantId },
      });
      const allApproved = allVerifications.every(v => v.status === 'VERIFIED');
      if (allApproved) {
        await prisma.applicantProfile.update({
          where: { id: verification.applicantId },
          data: { verificationStatus: 'VERIFIED' },
        });
      }
    }

    if (verification.applicant?.user) {
      await prisma.notification.create({
        data: {
          userId: verification.applicant.user.id,
          title: `${verification.type} Verification: ${status}`,
          message: `Your ${verification.type} verification status has been updated to "${status}".`,
          type: status === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
        },
      }).catch(() => {});
    }

    res.json({ success: true, data: verification, message: 'Verification status updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update verification' });
  }
});

// POST /api/official/courses
router.post('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, duration, level, availableSeats, instructor, skills } = req.body;
    const course = await prisma.course.create({
      data: {
        name,
        description,
        duration,
        level,
        availableSeats: availableSeats ? parseInt(availableSeats) : 50,
        instructor,
      },
    });

    if (skills && Array.isArray(skills)) {
      for (const skillName of skills) {
        let skill = await prisma.skill.findUnique({ where: { name: skillName } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skillName, category: 'Technical' } });
        }
        await prisma.courseSkill.create({
          data: { courseId: course.id, skillId: skill.id },
        }).catch(() => {});
      }
    }

    res.status(201).json({ success: true, data: course, message: 'Course created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create course' });
  }
});

// PUT /api/official/courses/:id
router.put('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, duration, level, availableSeats, instructor, isActive } = req.body;
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        name: name || undefined,
        description: description || undefined,
        duration: duration || undefined,
        level: level || undefined,
        availableSeats: availableSeats !== undefined ? parseInt(availableSeats) : undefined,
        instructor: instructor || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });
    res.json({ success: true, data: course, message: 'Course updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update course' });
  }
});

// DELETE /api/official/courses/:id
router.delete('/courses/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete course' });
  }
});

// GET /api/official/activity-logs
router.get('/activity-logs', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', action } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: { select: { email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({ success: true, data: { logs, total } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch activity logs' });
  }
});

export default router;
