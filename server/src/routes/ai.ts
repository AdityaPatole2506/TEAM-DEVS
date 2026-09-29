import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { prisma } from '../utils/prisma';
import { analyzeSkillGap } from '../services/aiGapAnalyzerService';

const router = Router();
router.use(authenticate);

// POST /api/ai/gap-analysis
router.post('/gap-analysis', async (req: AuthRequest, res: Response) => {
  try {
    const { targetRole, currentSkills, education, experience, certifications } = req.body;

    if (!targetRole || !currentSkills || currentSkills.length === 0) {
      return res.status(400).json({ success: false, error: 'Target role and current skills are required' });
    }

    // Perform AI analysis
    const analysisResult = await analyzeSkillGap({
      targetRole,
      currentSkills,
      education,
      experience,
      certifications,
    });

    // Save to database if user is applicant
    let savedAnalysis = null;
    if (req.user!.role === 'APPLICANT') {
      const profile = await prisma.applicantProfile.findUnique({ where: { userId: req.user!.id } });
      if (profile) {
        // Find recommended courses
        const recommendedCourses = await prisma.course.findMany({
          where: {
            name: {
              in: analysisResult.recommendedCourseNames,
            },
          },
          take: 3,
        });

        savedAnalysis = await prisma.gapAnalysis.create({
          data: {
            applicantId: profile.id,
            targetRole,
            matchPercentage: analysisResult.matchPercentage,
            summary: analysisResult.summary,
            isDemo: analysisResult.isDemo,
            skillGaps: {
              create: analysisResult.skillGaps.map(gap => ({
                skillName: gap.skillName,
                currentLevel: gap.currentLevel,
                requiredLevel: gap.requiredLevel,
                priority: gap.priority as any,
              })),
            },
            learningPath: {
              create: analysisResult.learningPath.map(lp => ({
                stage: lp.stage,
                topic: lp.topic,
                duration: lp.duration,
                description: lp.description,
              })),
            },
            recommendations: {
              create: recommendedCourses.map(course => ({
                courseId: course.id,
                reason: `Recommended for ${targetRole} skill development`,
              })),
            },
          },
          include: {
            skillGaps: true,
            learningPath: { orderBy: { stage: 'asc' } },
            recommendations: { include: { course: true } },
          },
        });

        // Create notification
        await prisma.notification.create({
          data: {
            userId: req.user!.id,
            title: 'AI Gap Analysis Completed!',
            message: `Your skill gap analysis for "${targetRole}" is ready. Profile match: ${analysisResult.matchPercentage}%`,
            type: 'AI_ANALYSIS',
          },
        });
      }
    }

    res.json({
      success: true,
      data: {
        ...analysisResult,
        savedAnalysisId: savedAnalysis?.id,
      },
      message: analysisResult.isDemo ? 'AI Demo Analysis completed' : 'AI Analysis completed',
    });
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to perform gap analysis' });
  }
});

// GET /api/ai/gap-analysis
router.get('/gap-analysis', async (req: AuthRequest, res: Response) => {
  try {
    let where: any = {};

    if (req.user!.role === 'APPLICANT') {
      const profile = await prisma.applicantProfile.findUnique({ where: { userId: req.user!.id } });
      if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
      where = { applicantId: profile.id };
    }

    const analyses = await prisma.gapAnalysis.findMany({
      where,
      include: {
        skillGaps: true,
        learningPath: { orderBy: { stage: 'asc' } },
        recommendations: { include: { course: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({ success: true, data: analyses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch analyses' });
  }
});

// GET /api/ai/gap-analysis/:id
router.get('/gap-analysis/:id', async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await prisma.gapAnalysis.findUnique({
      where: { id: req.params.id },
      include: {
        skillGaps: true,
        learningPath: { orderBy: { stage: 'asc' } },
        recommendations: { include: { course: true } },
        applicant: { select: { fullName: true, applicantId: true } },
      },
    });

    if (!analysis) return res.status(404).json({ success: false, error: 'Analysis not found' });

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch analysis' });
  }
});

export default router;
