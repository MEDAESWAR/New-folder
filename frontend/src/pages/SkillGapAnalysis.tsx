import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { careerApi } from '../api/career.api';

const SkillGapAnalysis = () => {
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const { data: skills } = useQuery({
    queryKey: ['skills'],
    queryFn: careerApi.getSkills,
  });

  const analyzeMutation = useMutation({
    mutationFn: () =>
      careerApi.analyzeSkillGap(
        targetRole,
        jobDescription || undefined
      ),
  });

  const handleAnalyze = () => {
    if (!targetRole.trim()) return;
    analyzeMutation.mutate();
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Skill Gap Analysis</h1>
        <p className="mt-2 text-gray-600">
          Identify skills you need to develop for your target role
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Your Current Skills</h2>
          <div className="space-y-2 mb-4">
            {skills && skills.length > 0 ? (
              skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({skill.category})
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {skill.proficiency}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No skills added yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Analyze Gap</h2>
          <div className="space-y-4">
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
                Job Description (optional)
              </label>
              <textarea
                className="input-field"
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description for more accurate analysis..."
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending || !targetRole.trim()}
              className="btn-primary w-full"
            >
              {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Skill Gap'}
            </button>
          </div>
        </div>
      </div>

      {analyzeMutation.data && (
        <div className="mt-6 space-y-6">
          {analyzeMutation.data.missingSkills &&
            analyzeMutation.data.missingSkills.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Missing Skills</h2>
                <div className="space-y-3">
                  {analyzeMutation.data.missingSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-4 border rounded"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{skill.skill}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            skill.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : skill.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {skill.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{skill.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {analyzeMutation.data.weakAreas &&
            analyzeMutation.data.weakAreas.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Areas to Strengthen</h2>
                <div className="space-y-3">
                  {analyzeMutation.data.weakAreas.map((area, idx) => (
                    <div key={idx} className="p-4 border rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{area.skill}</span>
                        <div className="text-sm">
                          <span className="text-gray-600">
                            {area.currentLevel} → {area.targetLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {analyzeMutation.data.recommendations &&
            analyzeMutation.data.recommendations.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
                <ul className="space-y-2">
                  {analyzeMutation.data.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-primary-600 mr-2">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;
