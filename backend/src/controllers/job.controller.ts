import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import JobDescription from '../models/jobDescription.model';
import Resume from '../models/resume.model';
import { z } from 'zod';
import {
  analyzeJobDescription,
  generateCoverLetter,
} from '../services/ai.service';

const jobDescriptionSchema = z.object({
  title: z.string().min(1),
  company: z.string().optional(),
  description: z.string().min(1),
});

export const analyzeJob = async (req: AuthRequest, res: Response) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const analysis = await analyzeJobDescription(description);

    // Save to database
    const saved = await JobDescription.create({
      userId: req.userId,
      title: req.body.title || 'Untitled Job',
      company: req.body.company || undefined,
      description,
      extractedData: analysis,
    });

    res.json({ ...analysis, id: saved._id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getJobDescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await JobDescription.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getJobDescription = async (req: AuthRequest, res: Response) => {
  try {
    const job = await JobDescription.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!job) {
      return res.status(404).json({ error: 'Job description not found' });
    }

    res.json(job);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const compareResumeWithJob = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { resumeId, jobDescriptionId } = req.body;

    if (!resumeId || !jobDescriptionId) {
      return res
        .status(400)
        .json({ error: 'resumeId and jobDescriptionId are required' });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.userId,
    });

    const job = await JobDescription.findOne({
      _id: jobDescriptionId,
      userId: req.userId,
    });

    if (!resume || !job) {
      return res.status(404).json({ error: 'Resume or job not found' });
    }

    // Calculate match score (simplified - can be enhanced with AI)
    const resumeSkills = (resume.skills as any[]) || [];
    const jobSkills =
      ((job.extractedData as any)?.requiredSkills as string[]) || [];

    const matchingSkills = resumeSkills.filter((skill) =>
      jobSkills.some(
        (js) => js.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(js.toLowerCase())
      )
    );

    const matchScore = jobSkills.length > 0
      ? (matchingSkills.length / jobSkills.length) * 100
      : 0;

    // Update match score
    await JobDescription.findByIdAndUpdate(jobDescriptionId, { matchScore });

    res.json({
      matchScore: Math.round(matchScore),
      matchingSkills,
      missingSkills: jobSkills.filter(
        (js) =>
          !resumeSkills.some(
            (rs) =>
              js.toLowerCase().includes(rs.toLowerCase()) ||
              rs.toLowerCase().includes(js.toLowerCase())
          )
      ),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCoverLetter = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescriptionId, companyName, jobTitle } = req.body;

    if (!resumeId || !jobDescriptionId) {
      return res
        .status(400)
        .json({ error: 'resumeId and jobDescriptionId are required' });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.userId,
    });

    const job = await JobDescription.findOne({
      _id: jobDescriptionId,
      userId: req.userId,
    });

    if (!resume || !job) {
      return res.status(404).json({ error: 'Resume or job not found' });
    }

    const coverLetter = await generateCoverLetter(
      resume,
      job.description,
      companyName || job.company || 'the company',
      jobTitle || job.title
    );

    res.json({ coverLetter });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
