import api from './axios';

export interface JobDescription {
  id: string;
  title: string;
  company?: string;
  description: string;
  extractedData?: {
    requiredSkills: string[];
    keywords: string[];
    experienceLevel: string;
    responsibilities: string[];
  };
  matchScore?: number;
  createdAt: string;
}

export const jobApi = {
  analyze: async (data: {
    title: string;
    company?: string;
    description: string;
  }) => {
    const response = await api.post('/jobs/analyze', data);
    return response.data;
  },
  getAll: async (): Promise<JobDescription[]> => {
    const response = await api.get('/jobs');
    return response.data;
  },
  getById: async (id: string): Promise<JobDescription> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },
  compare: async (resumeId: string, jobDescriptionId: string) => {
    const response = await api.post('/jobs/compare', {
      resumeId,
      jobDescriptionId,
    });
    return response.data;
  },
  generateCoverLetter: async (data: {
    resumeId: string;
    jobDescriptionId: string;
    companyName?: string;
    jobTitle?: string;
  }) => {
    const response = await api.post('/jobs/cover-letter', data);
    return response.data;
  },
};
