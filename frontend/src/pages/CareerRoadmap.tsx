import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { careerApi } from '../api/career.api';

const CareerRoadmap = () => {
  const [currentRole, setCurrentRole] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [timeline, setTimeline] = useState<'Short-term' | 'Long-term'>('Short-term');

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: careerApi.getCareerGoals,
  });

  const pathMutation = useMutation({
    mutationFn: () =>
      careerApi.createCareerPath({
        currentRole,
        targetRole,
        timeline,
      }),
  });

  const handleGeneratePath = () => {
    if (!currentRole.trim() || !targetRole.trim()) return;
    pathMutation.mutate();
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Career Roadmap</h1>
        <p className="mt-2 text-gray-600">
          Plan your career path with AI-guided milestones
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Your Career Goals</h2>
          <div className="space-y-3">
            {goals && goals.length > 0 ? (
              goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 border rounded hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{goal.targetRole}</h3>
                      {goal.industry && (
                        <p className="text-sm text-gray-600">{goal.industry}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        goal.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : goal.status === 'achieved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{goal.timeline}</span>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-gray-600 mt-2">
                      {goal.description}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No career goals set yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Generate Career Path</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role
              </label>
              <input
                type="text"
                className="input-field"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                placeholder="e.g., Junior Developer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Role
              </label>
              <input
                type="text"
                className="input-field"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <select
                className="input-field"
                value={timeline}
                onChange={(e) =>
                  setTimeline(e.target.value as 'Short-term' | 'Long-term')
                }
              >
                <option value="Short-term">Short-term</option>
                <option value="Long-term">Long-term</option>
              </select>
            </div>
            <button
              onClick={handleGeneratePath}
              disabled={
                pathMutation.isPending ||
                !currentRole.trim() ||
                !targetRole.trim()
              }
              className="btn-primary w-full"
            >
              {pathMutation.isPending
                ? 'Generating...'
                : 'Generate Career Path'}
            </button>
          </div>
        </div>
      </div>

      {pathMutation.data && (
        <div className="mt-6 space-y-6">
          {pathMutation.data.milestones &&
            pathMutation.data.milestones.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Milestones</h2>
                <div className="space-y-4">
                  {pathMutation.data.milestones.map((milestone, idx) => (
                    <div key={idx} className="p-4 border-l-4 border-primary-500 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">
                          {milestone.title}
                        </h3>
                        <span className="text-sm text-gray-600">
                          {milestone.timeline}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">
                        {milestone.description}
                      </p>
                      <div className="space-y-2">
                        {milestone.skills && milestone.skills.length > 0 && (
                          <div>
                            <strong className="text-sm">Skills to Learn:</strong>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {milestone.skills.map((skill, skillIdx) => (
                                <span
                                  key={skillIdx}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {milestone.resources &&
                          milestone.resources.length > 0 && (
                            <div>
                              <strong className="text-sm">Resources:</strong>
                              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                                {milestone.resources.map((resource, resIdx) => (
                                  <li key={resIdx}>{resource}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {pathMutation.data.roadmap && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Roadmap Overview</h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {pathMutation.data.roadmap}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CareerRoadmap;
