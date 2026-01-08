import api from './axios';

export interface Resume {
  id: string;
  title: string;
  summary?: string;
  experience: any[];
  education: any[];
  skills: any[];
  projects?: any[];
  template: string;
  createdAt: string;
  updatedAt: string;
}

export const resumeApi = {
  create: async (data: Partial<Resume>) => {
    const response = await api.post('/resumes', data);
    return response.data;
  },
  getAll: async (): Promise<Resume[]> => {
    const response = await api.get('/resumes');
    return response.data;
  },
  getById: async (id: string): Promise<Resume> => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },
  update: async (id: string, data: Partial<Resume>) => {
    const response = await api.put(`/resumes/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },
  improveBullet: async (bulletPoint: string, context?: string) => {
    const response = await api.post('/resumes/improve-bullet', {
      bulletPoint,
      context,
    });
    return response.data;
  },
  optimizeForJob: async (resumeId: string, jobDescription: string) => {
    const response = await api.post('/resumes/optimize', {
      resumeId,
      jobDescription,
    });
    return response.data;
  },
};
