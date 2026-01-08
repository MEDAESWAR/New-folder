import api from './axios';

export interface InterviewSession {
  id: string;
  jobTitle: string;
  company?: string;
  questions: Array<{ question: string; answer: string }>;
  feedback?: Record<string, any>;
  score?: number;
  createdAt: string;
}

export const interviewApi = {
  createSession: async (data: {
    jobTitle: string;
    company?: string;
    jobDescription?: string;
  }) => {
    const response = await api.post('/interviews', data);
    return response.data;
  },
  getAll: async (): Promise<InterviewSession[]> => {
    const response = await api.get('/interviews');
    return response.data;
  },
  getById: async (id: string): Promise<InterviewSession> => {
    const response = await api.get(`/interviews/${id}`);
    return response.data;
  },
  submitAnswer: async (
    id: string,
    data: {
      questionIndex: number;
      answer: string;
      jobDescription?: string;
    }
  ) => {
    const response = await api.post(`/interviews/${id}/answer`, data);
    return response.data;
  },
  complete: async (id: string) => {
    const response = await api.post(`/interviews/${id}/complete`);
    return response.data;
  },
};
