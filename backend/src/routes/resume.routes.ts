import { Router } from 'express';
import {
  createResume,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
  improveBulletPoint,
  optimizeForJob,
} from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);
router.post('/improve-bullet', improveBulletPoint);
router.post('/optimize', optimizeForJob);

export default router;
