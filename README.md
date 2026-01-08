# Career Mentor - AI-Powered Resume Builder & Career Guidance Application

A complete full-stack application that helps users build ATS-optimized resumes, generate cover letters, receive AI-driven career guidance, identify skill gaps, plan career paths, and practice interviews.

## Tech Stack

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL with Prisma ORM
- JWT Authentication
- OpenAI API integration

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand (state management)
- TanStack Query (React Query)
- Axios

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic & AI services
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & error handling
│   │   └── server.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # API client functions
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── store/           # State management
│   │   └── App.tsx          # Main app component
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
DATABASE_URL="postgresql://user:password@localhost:5432/career_mentor?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
OPENAI_API_KEY="your-openai-api-key"
PORT=5000
NODE_ENV=development
```

5. Generate Prisma client:
```bash
npm run db:generate
```

6. Run database migrations:
```bash
npm run db:migrate
```

7. Start the development server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Features

### 1. Authentication & User Profile
- User registration and login
- JWT-based authentication
- User profile management

### 2. AI-Powered Resume Builder
- Step-by-step resume creation wizard
- ATS-friendly templates
- AI-powered bullet point improvement
- Resume optimization for specific jobs
- Export to PDF/DOCX (ready for implementation)

### 3. Job Description Analyzer
- Extract required skills and keywords
- Experience level detection
- Resume-job matching score
- Missing skills identification

### 4. Cover Letter Generator
- AI-generated personalized cover letters
- Based on resume and job description
- Editable before download

### 5. Career Guidance Agent
- Conversational AI assistant
- Career advice and guidance
- Job role suitability assessment
- Skill roadmap questions
- Context-aware responses

### 6. Skill Gap Analyzer
- Compare current skills vs target role
- Identify missing skills
- Prioritize learning areas
- Actionable recommendations

### 7. Career Path Planner
- Short-term and long-term goal setting
- AI-generated career roadmaps
- Milestone tracking
- Skill development timeline

### 8. Interview Practice Module
- AI-generated interview questions
- Mock interview sessions
- Answer feedback and scoring
- Improvement suggestions

### 9. Dashboard & Analytics
- Resume completion tracking
- Job readiness score
- Skill progress monitoring
- Career recommendations summary

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Resumes
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/:id` - Get resume by ID
- `POST /api/resumes` - Create resume
- `PUT /api/resumes/:id` - Update resume
- `DELETE /api/resumes/:id` - Delete resume
- `POST /api/resumes/improve-bullet` - Improve bullet point
- `POST /api/resumes/optimize` - Optimize resume for job

### Jobs
- `POST /api/jobs/analyze` - Analyze job description
- `GET /api/jobs` - Get all job descriptions
- `GET /api/jobs/:id` - Get job description by ID
- `POST /api/jobs/compare` - Compare resume with job
- `POST /api/jobs/cover-letter` - Generate cover letter

### Career
- `POST /api/career/chat` - Chat with career agent
- `GET /api/career/chat` - Get chat history
- `POST /api/career/skill-gap` - Analyze skill gaps
- `POST /api/career/path` - Generate career path
- `GET /api/career/skills` - Get all skills
- `POST /api/career/skills` - Create skill
- `PUT /api/career/skills/:id` - Update skill
- `DELETE /api/career/skills/:id` - Delete skill
- `GET /api/career/goals` - Get career goals
- `POST /api/career/goals` - Create career goal
- `PUT /api/career/goals/:id` - Update career goal
- `DELETE /api/career/goals/:id` - Delete career goal

### Interviews
- `POST /api/interviews` - Create interview session
- `GET /api/interviews` - Get all interview sessions
- `GET /api/interviews/:id` - Get interview session by ID
- `POST /api/interviews/:id/answer` - Submit answer
- `POST /api/interviews/:id/complete` - Complete interview

## Database Schema

The application uses PostgreSQL with the following main tables:
- `users` - User accounts
- `resumes` - Resume documents
- `skills` - User skills
- `career_goals` - Career objectives
- `job_descriptions` - Analyzed job postings
- `ai_chats` - Career chat conversations
- `interview_sessions` - Interview practice sessions

## AI Integration

The application uses OpenAI's GPT-4 model for:
- Resume content improvement
- Job description analysis
- Cover letter generation
- Career guidance conversations
- Skill gap analysis
- Career path planning
- Interview question generation
- Answer feedback

All AI prompts are structured and include user context for personalized responses.

## Development

### Backend Development
```bash
cd backend
npm run dev  # Start with hot reload
npm run build  # Build for production
npm start  # Run production build
```

### Frontend Development
```bash
cd frontend
npm run dev  # Start development server
npm run build  # Build for production
npm run preview  # Preview production build
```

### Database Management
```bash
cd backend
npm run db:generate  # Generate Prisma client
npm run db:migrate  # Run migrations
npm run db:studio  # Open Prisma Studio
```

## Production Deployment

1. Set environment variables in production
2. Build both frontend and backend
3. Set up PostgreSQL database
4. Run migrations
5. Deploy backend to your server
6. Deploy frontend to static hosting or serve from backend

## License

This project is provided as-is for educational and development purposes.
