import { Router } from 'express';
import {
  chatWithCareerAgent,
  getChatHistory,
  analyzeSkillGap,
  createCareerPath,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getCareerGoals,
  createCareerGoal,
  updateCareerGoal,
  deleteCareerGoal,
} from '../controllers/career.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/chat', chatWithCareerAgent);
router.get('/chat', getChatHistory);
router.post('/skill-gap', analyzeSkillGap);
router.post('/path', createCareerPath);

router.get('/skills', getSkills);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

router.get('/goals', getCareerGoals);
router.post('/goals', createCareerGoal);
router.put('/goals/:id', updateCareerGoal);
router.delete('/goals/:id', deleteCareerGoal);

export default router;
