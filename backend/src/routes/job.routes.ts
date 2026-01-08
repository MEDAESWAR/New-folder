import { Router } from 'express';
import {
  analyzeJob,
  getJobDescriptions,
  getJobDescription,
  compareResumeWithJob,
  createCoverLetter,
} from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/analyze', analyzeJob);
router.get('/', getJobDescriptions);
router.get('/:id', getJobDescription);
router.post('/compare', compareResumeWithJob);
router.post('/cover-letter', createCoverLetter);

export default router;
