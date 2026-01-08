import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';
import {
  generateInterviewQuestions,
  provideInterviewFeedback,
} from '../services/ai.service';

const prisma = new PrismaClient();

export const createInterviewSession = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { jobTitle, company, jobDescription } = req.body;

    if (!jobTitle) {
      return res.status(400).json({ error: 'jobTitle is required' });
    }

    // Get user's latest resume for context
    const resume = await prisma.resume.findFirst({
      where: { userId: req.userId! },
      orderBy: { updatedAt: 'desc' },
    });

    const questions = await generateInterviewQuestions(
      jobTitle,
      jobDescription || '',
      resume || {}
    );

    const session = await prisma.interviewSession.create({
      data: {
        userId: req.userId!,
        jobTitle,
        company: company || null,
        questions: questions.map((q) => ({ question: q, answer: '' })),
      },
    });

    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInterviewSessions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const sessions = await prisma.interviewSession.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
    });
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInterviewSession = async (req: AuthRequest, res: Response) => {
  try {
    const session = await prisma.interviewSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    res.json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const submitAnswer = async (req: AuthRequest, res: Response) => {
  try {
    const { questionIndex, answer, jobDescription } = req.body;

    if (questionIndex === undefined || !answer) {
      return res
        .status(400)
        .json({ error: 'questionIndex and answer are required' });
    }

    const session = await prisma.interviewSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    const questions = session.questions as Array<{
      question: string;
      answer: string;
    }>;

    if (questionIndex >= questions.length) {
      return res.status(400).json({ error: 'Invalid question index' });
    }

    // Get feedback
    const feedback = await provideInterviewFeedback(
      questions[questionIndex].question,
      answer,
      jobDescription || ''
    );

    // Update question with answer and feedback
    questions[questionIndex].answer = answer;

    // Update session
    const updated = await prisma.interviewSession.update({
      where: { id: req.params.id },
      data: {
        questions,
        feedback: {
          ...((session.feedback as any) || {}),
          [questionIndex]: feedback,
        },
      },
    });

    res.json({ session: updated, feedback });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeInterview = async (req: AuthRequest, res: Response) => {
  try {
    const session = await prisma.interviewSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId!,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    const feedback = (session.feedback as any) || {};
    const feedbackScores = Object.values(feedback).map(
      (f: any) => f.score || 0
    );

    const averageScore =
      feedbackScores.length > 0
        ? feedbackScores.reduce((a: number, b: number) => a + b, 0) /
          feedbackScores.length
        : 0;

    const updated = await prisma.interviewSession.update({
      where: { id: req.params.id },
      data: { score: averageScore },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
