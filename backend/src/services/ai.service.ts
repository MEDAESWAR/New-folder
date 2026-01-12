
const HF_API_URL = process.env.HF_API_URL;
const HF_MODEL_NAME = process.env.HF_MODEL_NAME;

if (!HF_API_URL || !HF_MODEL_NAME) {
  console.warn('WARNING: HF_API_URL or HF_MODEL_NAME is not set. AI features will not work.');
}

interface HfMessage {
  role: string;
  content: string;
}

const callHuggingFace = async (messages: HfMessage[]) => {
  if (!HF_API_URL || !HF_MODEL_NAME) {
    throw new Error('Hugging Face API not configured. Please set HF_API_URL and HF_MODEL_NAME in your .env file.');
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL_NAME,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HF API Error Details:', errorText);
      throw new Error(`HF API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('HF API Response:', JSON.stringify(data, null, 2)); // Debug log

    // Handle both OpenAI standard format and the custom model format observed
    const content = data.choices?.[0]?.message?.content || data.message?.content || '';
    return content.trim();
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    throw error;
  }
};

// Resume improvement prompts
export const improveResumeBullet = async (
  bulletPoint: string,
  context?: string
): Promise<string> => {
  const prompt = `You are a professional resume writer. Rewrite the following bullet point to be more impactful, professional, and ATS-friendly. Use action verbs and quantify achievements where possible.

Original bullet point: "${bulletPoint}"
${context ? `Context: ${context}` : ''}

Return only the improved bullet point, nothing else.`;

  return callHuggingFace([
    {
      role: 'system',
      content: 'You are an expert resume writer specializing in ATS optimization and professional writing.',
    },
    { role: 'user', content: prompt },
  ]);
};

export const optimizeResumeForJob = async (
  resumeContent: string,
  jobDescription: string
): Promise<{
  optimizedContent: string;
  suggestions: string[];
  keywords: string[];
}> => {
  const prompt = `Analyze this resume and job description. Provide:
1. An optimized version of the resume summary and key sections
2. Specific suggestions for improvement
3. Important keywords from the job description that should be included

Resume:
${resumeContent}

Job Description:
${jobDescription}

Return a STRICT JSON object with these exact keys:
- "optimizedContent": string
- "suggestions": string array
- "keywords": string array

Do NOT include any markdown formatting like \`\`\`json. Just the raw JSON string.`;

  const response = await callHuggingFace([
    {
      role: 'system',
      content: 'You are an ATS optimization expert. You must return only valid JSON.',
    },
    { role: 'user', content: prompt },
  ]);

  try {
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanResponse);
  } catch (e) {
    console.error('Failed to parse JSON from AI response:', response);
    return {
      optimizedContent: resumeContent,
      suggestions: ['AI response parsing failed'],
      keywords: [],
    };
  }
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
  const prompt = `Extract key information from this job description:

${jobDescription}

Return a STRICT JSON object with these exact keys:
- "requiredSkills": array of technical and soft skills
- "keywords": important keywords for ATS matching
- "experienceLevel": "Entry", "Mid", "Senior", or "Executive"
- "responsibilities": array of main responsibilities

Do NOT include any markdown formatting like \`\`\`json. Just the raw JSON string.`;

  const response = await callHuggingFace([
    {
      role: 'system',
      content: 'You are a job market analyst. You must return only valid JSON.',
    },
    { role: 'user', content: prompt },
  ]);

  try {
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanResponse);
  } catch (e) {
    console.error('Failed to parse JSON from AI response:', response);
    return {
      requiredSkills: [],
      keywords: [],
      experienceLevel: 'Unknown',
      responsibilities: [],
    };
  }
};

// Cover letter generation
export const generateCoverLetter = async (
  resumeData: any,
  jobDescription: string,
  companyName: string,
  jobTitle: string
): Promise<string> => {
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

  return callHuggingFace([
    {
      role: 'system',
      content: 'You are a professional cover letter writer. Write compelling, personalized cover letters.',
    },
    { role: 'user', content: prompt },
  ]);
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

  const messages: HfMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  return callHuggingFace(messages);
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

Return a STRICT JSON object with these exact keys:
- "missingSkills": array of objects with keys "skill", "priority" ("High"/"Medium"/"Low"), "reason"
- "weakAreas": array of objects with keys "skill", "currentLevel", "targetLevel"
- "recommendations": array of actionable learning recommendations

Do NOT include any markdown formatting like \`\`\`json. Just the raw JSON string.`;

  const response = await callHuggingFace([
    {
      role: 'system',
      content: 'You are a career development expert specializing in skill gap analysis. You must return only valid JSON.',
    },
    { role: 'user', content: prompt },
  ]);

  try {
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanResponse);
  } catch (e) {
    console.error('Failed to parse JSON from AI response:', response);
    return {
      missingSkills: [],
      weakAreas: [],
      recommendations: [],
    };
  }
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

Return a STRICT JSON object with these exact keys:
- "milestones": array of objects with keys "title", "description", "timeline", "skills" (array), "resources" (array)
- "roadmap": a comprehensive text description of the path

Do NOT include any markdown formatting like \`\`\`json. Just the raw JSON string.`;

  const response = await callHuggingFace([
    {
      role: 'system',
      content: 'You are a career planning expert. Create actionable, realistic career paths. You must return only valid JSON.',
    },
    { role: 'user', content: prompt },
  ]);

  try {
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanResponse);
  } catch (e) {
    console.error('Failed to parse JSON from AI response:', response);
    return {
      milestones: [],
      roadmap: 'Failed to generate roadmap due to AI parsing error.',
    };
  }
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

Return a STRICT JSON array of question strings in this format: ["Question 1", "Question 2", ...].
Do NOT return an object. Just the array.
Do NOT include any markdown formatting.`;

  const response = await callHuggingFace([
    {
      role: 'system',
      content: 'You are an interview preparation expert. return only a JSON array of questions.',
    },
    { role: 'user', content: prompt },
  ]);

  try {
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(cleanResponse);
    return Array.isArray(result) ? result : (result.questions || []);
  } catch (e) {
    console.error('Failed to parse JSON from AI response:', response);
    return [];
  }
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

Return a STRICT JSON object with these exact keys:
- "score": number 0-100
- "strengths": array of what was good
- "improvements": array of specific suggestions
- "suggestedAnswer": an improved version of the answer

Do NOT include any markdown formatting like \`\`\`json. Just the raw JSON string.`;

  const response = await callHuggingFace([
    {
      role: 'system',
      content: 'You are an interview coach providing constructive feedback. You must return only valid JSON.',
    },
    { role: 'user', content: prompt },
  ]);

  try {
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanResponse);
  } catch (e) {
    console.error('Failed to parse JSON from AI response:', response);
    return {
      score: 0,
      strengths: [],
      improvements: ['AI response parsing failed'],
      suggestedAnswer: '',
    };
  }
};
