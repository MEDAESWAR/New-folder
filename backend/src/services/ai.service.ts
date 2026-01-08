import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('WARNING: OPENAI_API_KEY is not set. AI features will not work.');
}

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const ensureOpenAI = () => {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env file.');
  }
  return openai;
};

// Resume improvement prompts
export const improveResumeBullet = async (
  bulletPoint: string,
  context?: string
): Promise<string> => {
  const client = ensureOpenAI();

  const prompt = `You are a professional resume writer. Rewrite the following bullet point to be more impactful, professional, and ATS-friendly. Use action verbs and quantify achievements where possible.

Original bullet point: "${bulletPoint}"
${context ? `Context: ${context}` : ''}

Return only the improved bullet point, nothing else.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert resume writer specializing in ATS optimization and professional writing.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return response.choices[0].message.content?.trim() || bulletPoint;
};

export const optimizeResumeForJob = async (
  resumeContent: string,
  jobDescription: string
): Promise<{
  optimizedContent: string;
  suggestions: string[];
  keywords: string[];
}> => {
  const client = ensureOpenAI();

  const prompt = `Analyze this resume and job description. Provide:
1. An optimized version of the resume summary and key sections
2. Specific suggestions for improvement
3. Important keywords from the job description that should be included

Resume:
${resumeContent}

Job Description:
${jobDescription}

Return a JSON object with:
- optimizedContent: string
- suggestions: string[]
- keywords: string[]`;

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are an ATS optimization expert. Return only valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return {
    optimizedContent: result.optimizedContent || resumeContent,
    suggestions: result.suggestions || [],
    keywords: result.keywords || [],
  };
};

// Job description analysis
export const analyzeJobDescription = async (
  jobDescription: string
): Promise<{
  requiredSkills: string[];
  keywords: string[];
  experienceLevel: string;
  responsibilities: string[];
}> => {
  const client = ensureOpenAI();

  const prompt = `Extract key information from this job description:

${jobDescription}

Return a JSON object with:
- requiredSkills: array of technical and soft skills
- keywords: important keywords for ATS matching
- experienceLevel: "Entry", "Mid", "Senior", or "Executive"
- responsibilities: array of main responsibilities`;

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a job market analyst. Return only valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
};

// Cover letter generation
export const generateCoverLetter = async (
  resumeData: any,
  jobDescription: string,
  companyName: string,
  jobTitle: string
): Promise<string> => {
  const client = ensureOpenAI();

  const prompt = `Generate a professional, personalized cover letter for this position:

Job Title: ${jobTitle}
Company: ${companyName}

Job Description:
${jobDescription}

Applicant Background:
${JSON.stringify(resumeData, null, 2)}

Write a compelling cover letter that:
- Addresses the hiring manager professionally
- Highlights relevant experience and skills
- Shows enthusiasm for the role
- Is concise (3-4 paragraphs)
- Matches the tone of the job description

Return only the cover letter text, no additional formatting.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are a professional cover letter writer. Write compelling, personalized cover letters.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 800,
  });

  return response.choices[0].message.content || '';
};

// Career guidance chat
export const getCareerGuidance = async (
  userMessage: string,
  userContext: {
    experience?: any[];
    education?: any[];
    skills?: any[];
    goals?: any[];
  },
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> => {
  const client = ensureOpenAI();

  const systemPrompt = `You are a professional career coach and mentor. You help people with:
- Career advice and guidance
- Job role suitability assessment
- Skill development roadmaps
- Career transitions
- Interview preparation

User Context:
- Experience: ${JSON.stringify(userContext.experience || [])}
- Education: ${JSON.stringify(userContext.education || [])}
- Skills: ${JSON.stringify(userContext.skills || [])}
- Goals: ${JSON.stringify(userContext.goals || [])}

Provide helpful, actionable, and encouraging advice. Be professional but friendly.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: messages as any,
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content || '';
};

// Skill gap analysis
export const analyzeSkillGaps = async (
  currentSkills: string[],
  targetRole: string,
  jobDescription?: string
): Promise<{
  missingSkills: Array<{ skill: string; priority: string; reason: string }>;
  weakAreas: Array<{ skill: string; currentLevel: string; targetLevel: string }>;
  recommendations: string[];
}> => {
  const prompt = `Analyze skill gaps for someone targeting this role:

Target Role: ${targetRole}
${jobDescription ? `Job Description: ${jobDescription}` : ''}

Current Skills: ${currentSkills.join(', ')}

Return a JSON object with:
- missingSkills: array of {skill, priority: "High"/"Medium"/"Low", reason}
- weakAreas: array of {skill, currentLevel, targetLevel}
- recommendations: array of actionable learning recommendations`;

  const client = ensureOpenAI();

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are a career development expert specializing in skill gap analysis. Return only valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
};

// Career path planning
export const generateCareerPath = async (
  currentRole: string,
  targetRole: string,
  currentSkills: string[],
  timeline: string
): Promise<{
  milestones: Array<{
    title: string;
    description: string;
    timeline: string;
    skills: string[];
    resources: string[];
  }>;
  roadmap: string;
}> => {
  const prompt = `Create a detailed career path roadmap:

Current Role: ${currentRole}
Target Role: ${targetRole}
Timeline: ${timeline}
Current Skills: ${currentSkills.join(', ')}

Return a JSON object with:
- milestones: array of {title, description, timeline, skills, resources}
- roadmap: a comprehensive text description of the path`;

  const client = ensureOpenAI();

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are a career planning expert. Create actionable, realistic career paths. Return only valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
};

// Interview question generation
export const generateInterviewQuestions = async (
  jobTitle: string,
  jobDescription: string,
  resumeData: any
): Promise<string[]> => {
  const prompt = `Generate 10 relevant interview questions for this position:

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Candidate Background:
${JSON.stringify(resumeData, null, 2)}

Include a mix of:
- Technical questions
- Behavioral questions
- Role-specific questions

Return a JSON array of question strings.`;

  const client = ensureOpenAI();

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are an interview preparation expert. Return only a JSON array of questions.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result.questions || result || [];
};

// Interview answer feedback
export const provideInterviewFeedback = async (
  question: string,
  answer: string,
  jobDescription: string
): Promise<{
  score: number;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
}> => {
  const prompt = `Evaluate this interview answer:

Question: ${question}
Answer: ${answer}
Job Description: ${jobDescription}

Return a JSON object with:
- score: number 0-100
- strengths: array of what was good
- improvements: array of specific suggestions
- suggestedAnswer: an improved version of the answer`;

  const client = ensureOpenAI();

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are an interview coach providing constructive feedback. Return only valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
};
