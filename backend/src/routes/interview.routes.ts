import { Router } from 'express';
import {
  createInterviewSession,
  getInterviewSessions,
  getInterviewSession,
  submitAnswer,
  completeInterview,
} from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createInterviewSession);
router.get('/', getInterviewSessions);
router.get('/:id', getInterviewSession);
router.post('/:id/answer', submitAnswer);
router.post('/:id/complete', completeInterview);

export default router;
