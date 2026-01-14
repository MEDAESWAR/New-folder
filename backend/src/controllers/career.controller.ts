import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Resume from '../models/resume.model';
import Skill from '../models/skill.model';
import CareerGoal from '../models/careerGoal.model';
import AIChat from '../models/aiChat.model';
import { z } from 'zod';
import {
  getCareerGuidance,
  analyzeSkillGaps,
  generateCareerPath,
} from '../services/ai.service';

export const chatWithCareerAgent = async (req: AuthRequest, res: Response) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user context
    const [resumes, skills, goals] = await Promise.all([
      Resume.find({ userId: req.userId }).sort({ updatedAt: -1 }).limit(1),
      Skill.find({ userId: req.userId }),
      CareerGoal.find({ userId: req.userId, status: 'active' }),
    ]);

    const userContext = {
      experience: resumes[0]?.experience || [],
      education: resumes[0]?.education || [],
      skills: skills.map((s: any) => ({
        name: s.name,
        proficiency: s.proficiency,
      })),
      goals: goals.map((g: any) => ({
        targetRole: g.targetRole,
        timeline: g.timeline,
      })),
    };

    // Get conversation history if sessionId provided
    let conversationHistory: Array<{ role: string; content: string }> = [];
    if (sessionId) {
      const history = await AIChat.find({
        userId: req.userId,
        sessionId,
      })
        .sort({ createdAt: 1 })
        .limit(10);
      conversationHistory = history.map((h: any) => ({
        role: h.role,
        content: h.content,
      }));
    }

    // Get AI response
    const response = await getCareerGuidance(
      message,
      userContext,
      conversationHistory
    );

    // Save conversation
    const finalSessionId = sessionId || `session_${Date.now()}`;
    await AIChat.create({
      userId: req.userId,
      role: 'user',
      content: message,
      sessionId: finalSessionId,
    });

    await AIChat.create({
      userId: req.userId,
      role: 'assistant',
      content: response,
      sessionId: finalSessionId,
    });

    res.json({ response, sessionId: finalSessionId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.query;

    const chats = await AIChat.find({
      userId: req.userId,
      ...(sessionId ? { sessionId: sessionId as string } : {}),
    }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const analyzeSkillGap = async (req: AuthRequest, res: Response) => {
  try {
    const { targetRole, jobDescription } = req.body;

    if (!targetRole) {
      return res.status(400).json({ error: 'targetRole is required' });
    }

    // Get user skills
    const skills = await Skill.find({ userId: req.userId });

    const currentSkills = skills.map((s: any) => s.name);

    const analysis = await analyzeSkillGaps(
      currentSkills,
      targetRole,
      jobDescription
    );

    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCareerPath = async (req: AuthRequest, res: Response) => {
  try {
    const { currentRole, targetRole, timeline } = req.body;

    if (!currentRole || !targetRole || !timeline) {
      return res
        .status(400)
        .json({ error: 'currentRole, targetRole, and timeline are required' });
    }

    // Get user skills
    const skills = await Skill.find({ userId: req.userId });

    const currentSkills = skills.map((s: any) => s.name);

    const path = await generateCareerPath(
      currentRole,
      targetRole,
      currentSkills,
      timeline
    );

    res.json(path);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSkills = async (req: AuthRequest, res: Response) => {
  try {
    const skills = await Skill.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(skills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSkill = async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
    });

    const validatedData = schema.parse(req.body);

    const skill = await Skill.create({
      userId: req.userId,
      ...validatedData,
    });

    res.status(201).json(skill);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const updateSkill = async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      name: z.string().optional(),
      category: z.string().optional(),
      proficiency: z
        .enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
        .optional(),
    });

    const validatedData = schema.parse(req.body);

    const skill = await Skill.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      { $set: validatedData },
      { new: true }
    );

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json(skill);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const deleteSkill = async (req: AuthRequest, res: Response) => {
  try {
    const skill = await Skill.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCareerGoals = async (req: AuthRequest, res: Response) => {
  try {
    const goals = await CareerGoal.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCareerGoal = async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      targetRole: z.string().min(1),
      industry: z.string().optional(),
      timeline: z.enum(['Short-term', 'Long-term']),
      description: z.string().optional(),
    });

    const validatedData = schema.parse(req.body);

    const goal = await CareerGoal.create({
      userId: req.userId,
      ...validatedData,
    });

    res.status(201).json(goal);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const updateCareerGoal = async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      targetRole: z.string().optional(),
      industry: z.string().optional(),
      timeline: z.enum(['Short-term', 'Long-term']).optional(),
      description: z.string().optional(),
      status: z.enum(['active', 'achieved', 'paused']).optional(),
    });

    const validatedData = schema.parse(req.body);

    const goal = await CareerGoal.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      { $set: validatedData },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ error: 'Career goal not found' });
    }

    res.json(goal);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const deleteCareerGoal = async (req: AuthRequest, res: Response) => {
  try {
    const goal = await CareerGoal.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!goal) {
      return res.status(404).json({ error: 'Career goal not found' });
    }

    res.json({ message: 'Career goal deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
