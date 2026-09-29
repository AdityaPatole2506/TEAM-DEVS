import { Router, Response } from 'express';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';

const router = Router();
router.use(authenticate);

// GET /api/analytics/skills
router.get('/skills', authorize('GOVERNMENT_OFFICIAL', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const skillGaps = await prisma.skillGap.groupBy({
      by: ['skillName'],
      _count: { skillName: true },
      orderBy: { _count: { skillName: 'desc' } },
      take: 15,
    });

    const applicantSkills = await prisma.applicantSkill.groupBy({
      by: ['skillId'],
      _count: { skillId: true },
      orderBy: { _count: { skillId: 'desc' } },
      take: 10,
    });

    const skillDetails = await prisma.skill.findMany({
      where: { id: { in: applicantSkills.map(s => s.skillId) } },
    });

    const skillDistribution = applicantSkills.map(s => {
      const skill = skillDetails.find(d => d.id === s.skillId);
      return { name: skill?.name || 'Unknown', count: s._count.skillId, category: skill?.category };
    });

    res.json({
      success: true,
      data: {
        topSkillGaps: skillGaps.map(s => ({ skillName: s.skillName, count: s._count.skillName })),
        skillDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch skill analytics' });
  }
});

// GET /api/analytics/courses
router.get('/courses', async (req: AuthRequest, res: Response) => {
  try {
    const courseEnrollments = await prisma.course.findMany({
      include: {
        _count: { select: { enrollments: true } },
      },
      orderBy: { enrolledCount: 'desc' },
      take: 10,
    });

    const enrollmentsByStatus = await prisma.enrollment.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    res.json({
      success: true,
      data: {
        courseEnrollments: courseEnrollments.map(c => ({
          name: c.name,
          enrolled: c._count.enrollments,
          seats: c.availableSeats,
          level: c.level,
        })),
        enrollmentsByStatus: enrollmentsByStatus.map(e => ({
          status: e.status,
          count: e._count.status,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch course analytics' });
  }
});

// GET /api/analytics/gap-analysis
router.get('/gap-analysis', authorize('GOVERNMENT_OFFICIAL', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const totalAnalyses = await prisma.gapAnalysis.count();
    const avgMatch = await prisma.gapAnalysis.aggregate({ _avg: { matchPercentage: true } });

    const topTargetRoles = await prisma.gapAnalysis.groupBy({
      by: ['targetRole'],
      _count: { targetRole: true },
      orderBy: { _count: { targetRole: 'desc' } },
      take: 8,
    });

    const topSkillGaps = await prisma.skillGap.groupBy({
      by: ['skillName', 'priority'],
      _count: { skillName: true },
      orderBy: { _count: { skillName: 'desc' } },
      take: 10,
    });

    const matchDistribution = [
      { range: '0-20%', count: await prisma.gapAnalysis.count({ where: { matchPercentage: { lt: 20 } } }) },
      { range: '20-40%', count: await prisma.gapAnalysis.count({ where: { matchPercentage: { gte: 20, lt: 40 } } }) },
      { range: '40-60%', count: await prisma.gapAnalysis.count({ where: { matchPercentage: { gte: 40, lt: 60 } } }) },
      { range: '60-80%', count: await prisma.gapAnalysis.count({ where: { matchPercentage: { gte: 60, lt: 80 } } }) },
      { range: '80-100%', count: await prisma.gapAnalysis.count({ where: { matchPercentage: { gte: 80 } } }) },
    ];

    res.json({
      success: true,
      data: {
        totalAnalyses,
        avgMatchPercentage: Math.round(avgMatch._avg.matchPercentage || 0),
        topTargetRoles: topTargetRoles.map(r => ({ role: r.targetRole, count: r._count.targetRole })),
        topSkillGaps: topSkillGaps.map(g => ({ skillName: g.skillName, count: g._count.skillName, priority: g.priority })),
        matchDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch gap analysis analytics' });
  }
});

export default router;
