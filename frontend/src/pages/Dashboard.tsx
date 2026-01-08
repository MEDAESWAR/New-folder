import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { resumeApi } from '../api/resume.api';
import { jobApi } from '../api/job.api';
import { careerApi } from '../api/career.api';
import { interviewApi } from '../api/interview.api';

const Dashboard = () => {
  const { data: resumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeApi.getAll,
  });

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobApi.getAll,
  });

  const { data: skills } = useQuery({
    queryKey: ['skills'],
    queryFn: careerApi.getSkills,
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: careerApi.getCareerGoals,
  });

  const { data: interviews } = useQuery({
    queryKey: ['interviews'],
    queryFn: interviewApi.getAll,
  });

  const resumeCount = resumes?.length || 0;
  const jobCount = jobs?.length || 0;
  const skillCount = skills?.length || 0;
  const activeGoals = goals?.filter((g) => g.status === 'active').length || 0;
  const interviewCount = interviews?.length || 0;

  const stats = [
    { name: 'Resumes', value: resumeCount, link: '/resume', color: 'primary' },
    { name: 'Job Analyses', value: jobCount, link: '/jobs', color: 'green' },
    { name: 'Skills', value: skillCount, link: '/skill-gap', color: 'blue' },
    {
      name: 'Active Goals',
      value: activeGoals,
      link: '/roadmap',
      color: 'purple',
    },
    {
      name: 'Interviews',
      value: interviewCount,
      link: '/interview',
      color: 'orange',
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your AI Career Mentor dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}
                >
                  <span className={`text-${stat.color}-600 font-bold text-xl`}>
                    {stat.value}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/resume"
              className="block w-full btn-primary text-center"
            >
              Create New Resume
            </Link>
            <Link
              to="/jobs"
              className="block w-full btn-secondary text-center"
            >
              Analyze Job Description
            </Link>
            <Link
              to="/career-chat"
              className="block w-full btn-secondary text-center"
            >
              Chat with Career Agent
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {resumes && resumes.length > 0 && (
              <div className="text-sm">
                <p className="font-medium">Latest Resume</p>
                <p className="text-gray-600">{resumes[0].title}</p>
                <p className="text-gray-400 text-xs mt-1">
                  Updated {new Date(resumes[0].updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {jobs && jobs.length > 0 && (
              <div className="text-sm">
                <p className="font-medium">Latest Job Analysis</p>
                <p className="text-gray-600">{jobs[0].title}</p>
                {jobs[0].matchScore && (
                  <p className="text-gray-400 text-xs mt-1">
                    Match Score: {Math.round(jobs[0].matchScore)}%
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
