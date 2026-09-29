import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();

// GET /api/courses
router.get('/', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        courseSkills: { include: { skill: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:id
router.get('/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        courseSkills: { include: { skill: true } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch course' });
  }
});

// POST /api/courses/:id/enroll
router.post('/:id/enroll', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    if (!course.isActive) return res.status(400).json({ success: false, error: 'Course is not currently active' });

    const profile = await prisma.applicantProfile.findUnique({ where: { userId: req.user!.id } });
    if (!profile) return res.status(404).json({ success: false, error: 'Applicant profile not found' });

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { applicantId_courseId: { applicantId: profile.id, courseId: course.id } },
    });

    if (existing) {
      return res.status(409).json({ success: false, error: 'Already enrolled in this course' });
    }

    if (course.availableSeats > 0 && course.enrolledCount >= course.availableSeats) {
      return res.status(400).json({ success: false, error: 'No seats available for this course' });
    }

    const enrollment = await prisma.enrollment.create({
      data: { applicantId: profile.id, courseId: course.id },
      include: { course: true },
    });

    await prisma.course.update({
      where: { id: course.id },
      data: { enrolledCount: { increment: 1 } },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user!.id,
        title: 'Course Enrollment Successful!',
        message: `You have been successfully enrolled in "${course.name}".`,
        type: 'SUCCESS',
      },
    });

    // Create application record
    await prisma.application.create({
      data: {
        applicantId: profile.id,
        applicationType: 'COURSE_ENROLLMENT',
        program: course.name,
        status: 'SUBMITTED',
        statusHistory: {
          create: {
            status: 'SUBMITTED',
            remarks: `Enrolled in ${course.name}`,
          },
        },
      },
    });

    res.status(201).json({ success: true, data: enrollment, message: `Successfully enrolled in ${course.name}` });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ success: false, error: 'Failed to enroll in course' });
  }
});

export default router;
