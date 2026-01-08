import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import {
  improveResumeBullet,
  optimizeResumeForJob,
} from '../services/ai.service';

const prisma = new PrismaClient();

const resumeSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  experience: z.array(z.any()),
  education: z.array(z.any()),
  skills: z.array(z.any()),
  projects: z.array(z.any()).optional(),
  template: z.string().optional(),
});

export const createResume = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = resumeSchema.parse(req.body);
    const resume = await prisma.resume.create({
      data: {
        userId: req.userId!,
        ...validatedData,
      },
    });
    res.status(201).json(resume);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const getResumes = async (req: AuthRequest, res: Response) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: req.userId! },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(resumes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getResume = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json(resume);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateResume = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = resumeSchema.partial().parse(req.body);

    const resume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const updated = await prisma.resume.update({
      where: { id: req.params.id },
      data: validatedData,
    });

    res.json(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const deleteResume = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await prisma.resume.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    await prisma.resume.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Resume deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const improveBulletPoint = async (req: AuthRequest, res: Response) => {
  try {
    const { bulletPoint, context } = req.body;

    if (!bulletPoint || typeof bulletPoint !== 'string') {
      return res.status(400).json({ error: 'bulletPoint is required' });
    }

    const improved = await improveResumeBullet(bulletPoint, context);
    res.json({ improved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const optimizeForJob = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res
        .status(400)
        .json({ error: 'resumeId and jobDescription are required' });
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        userId: req.userId!,
      },
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const resumeContent = JSON.stringify(resume);
    const result = await optimizeResumeForJob(resumeContent, jobDescription);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
