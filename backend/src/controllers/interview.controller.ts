import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import InterviewSession from '../models/interviewSession.model';
import Resume from '../models/resume.model';
import {
  generateInterviewQuestions,
  provideInterviewFeedback,
} from '../services/ai.service';

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
    const resume = await Resume.findOne({ userId: req.userId }).sort({ updatedAt: -1 });

    const questions = await generateInterviewQuestions(
      jobTitle,
      jobDescription || '',
      resume || {}
    );

    const session = await InterviewSession.create({
      userId: req.userId,
      jobTitle,
      company: company || undefined,
      questions: questions.map((q) => ({ question: q, answer: '' })),
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
    const sessions = await InterviewSession.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInterviewSession = async (req: AuthRequest, res: Response) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.userId,
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

    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.userId,
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

    // Update question with answer
    questions[questionIndex].answer = answer;

    // Update session with new questions array and feedback
    // Note: Mongoose needs explicit markModified for mixed types or deeper updates sometimes,
    // but findOneAndUpdate with entire object work.
    // However, updating nested feedback object is trickier.
    // We will use $set.

    const currentFeedback = (session.feedback as any) || {};

    const updated = await InterviewSession.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          questions: questions,
          [`feedback.${questionIndex}`]: feedback
        }
      },
      { new: true }
    );

    res.json({ session: updated, feedback });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeInterview = async (req: AuthRequest, res: Response) => {
  try {
    const session = await InterviewSession.findOne({
      _id: req.params.id,
      userId: req.userId,
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

    const updated = await InterviewSession.findByIdAndUpdate(
      req.params.id,
      { score: averageScore },
      { new: true }
    );

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
