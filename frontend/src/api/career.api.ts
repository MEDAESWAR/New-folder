import api from './axios';

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  createdAt: string;
}

export interface CareerGoal {
  id: string;
  targetRole: string;
  industry?: string;
  timeline: 'Short-term' | 'Long-term';
  description?: string;
  status: 'active' | 'achieved' | 'paused';
  createdAt: string;
}

export const careerApi = {
  chat: async (message: string, sessionId?: string) => {
    const response = await api.post('/career/chat', { message, sessionId });
    return response.data;
  },
  getChatHistory: async (sessionId?: string) => {
    const response = await api.get('/career/chat', { params: { sessionId } });
    return response.data;
  },
  analyzeSkillGap: async (targetRole: string, jobDescription?: string) => {
    const response = await api.post('/career/skill-gap', {
      targetRole,
      jobDescription,
    });
    return response.data;
  },
  createCareerPath: async (data: {
    currentRole: string;
    targetRole: string;
    timeline: string;
  }) => {
    const response = await api.post('/career/path', data);
    return response.data;
  },
  getSkills: async (): Promise<Skill[]> => {
    const response = await api.get('/career/skills');
    return response.data;
  },
  createSkill: async (data: {
    name: string;
    category: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }) => {
    const response = await api.post('/career/skills', data);
    return response.data;
  },
  updateSkill: async (id: string, data: Partial<Skill>) => {
    const response = await api.put(`/career/skills/${id}`, data);
    return response.data;
  },
  deleteSkill: async (id: string) => {
    const response = await api.delete(`/career/skills/${id}`);
    return response.data;
  },
  getCareerGoals: async (): Promise<CareerGoal[]> => {
    const response = await api.get('/career/goals');
    return response.data;
  },
  createCareerGoal: async (data: {
    targetRole: string;
    industry?: string;
    timeline: 'Short-term' | 'Long-term';
    description?: string;
  }) => {
    const response = await api.post('/career/goals', data);
    return response.data;
  },
  updateCareerGoal: async (id: string, data: Partial<CareerGoal>) => {
    const response = await api.put(`/career/goals/${id}`, data);
    return response.data;
  },
  deleteCareerGoal: async (id: string) => {
    const response = await api.delete(`/career/goals/${id}`);
    return response.data;
  },
};
