import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Resume from '../models/resume.model';
import { z } from 'zod';
import {
  improveResumeBullet,
  optimizeResumeForJob,
} from '../services/ai.service';

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
    const resume = await Resume.create({
      userId: req.userId,
      ...validatedData,
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
    const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getResume = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.userId,
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

    const resume = await Resume.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      { $set: validatedData },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json(resume);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const deleteResume = async (req: AuthRequest, res: Response) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

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

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.userId!,
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
