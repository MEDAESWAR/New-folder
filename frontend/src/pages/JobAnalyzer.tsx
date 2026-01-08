import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApi, JobDescription } from '../api/job.api';
import { resumeApi } from '../api/resume.api';

const JobAnalyzer = () => {
  const queryClient = useQueryClient();
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [selectedResume, setSelectedResume] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: jobApi.getAll,
  });

  const { data: resumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeApi.getAll,
  });

  const analyzeMutation = useMutation({
    mutationFn: jobApi.analyze,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setJobDescription('');
      setJobTitle('');
      setCompany('');
    },
  });

  const compareMutation = useMutation({
    mutationFn: ({ resumeId, jobId }: { resumeId: string; jobId: string }) =>
      jobApi.compare(resumeId, jobId),
  });

  const coverLetterMutation = useMutation({
    mutationFn: jobApi.generateCoverLetter,
  });

  const handleAnalyze = () => {
    if (!jobDescription.trim()) return;
    analyzeMutation.mutate({
      title: jobTitle || 'Untitled Job',
      company: company || undefined,
      description: jobDescription,
    });
  };

  const handleCompare = () => {
    if (!selectedResume || !selectedJob) return;
    compareMutation.mutate({
      resumeId: selectedResume,
      jobId: selectedJob,
    });
  };

  const handleGenerateCoverLetter = () => {
    if (!selectedResume || !selectedJob) return;
    const job = jobs?.find((j) => j.id === selectedJob);
    coverLetterMutation.mutate({
      resumeId: selectedResume,
      jobDescriptionId: selectedJob,
      companyName: job?.company,
      jobTitle: job?.title,
    });
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Job Analyzer</h1>
        <p className="mt-2 text-gray-600">
          Analyze job descriptions and compare with your resume
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Analyze Job Description</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                className="input-field"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                className="input-field"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company name (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                className="input-field"
                rows={10}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending}
              className="btn-primary w-full"
            >
              {analyzeMutation.isPending ? 'Analyzing...' : 'Analyze Job'}
            </button>
          </div>

          {analyzeMutation.data && (
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Analysis Results</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Required Skills:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {analyzeMutation.data.requiredSkills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Keywords:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {analyzeMutation.data.keywords?.map((kw, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Experience Level:</strong>{' '}
                  {analyzeMutation.data.experienceLevel}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Compare Resume</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Resume
                </label>
                <select
                  className="input-field"
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                >
                  <option value="">Choose a resume...</option>
                  {resumes?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Job
                </label>
                <select
                  className="input-field"
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                >
                  <option value="">Choose a job...</option>
                  {jobs?.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} {j.company && `- ${j.company}`}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCompare}
                disabled={!selectedResume || !selectedJob || compareMutation.isPending}
                className="btn-primary w-full"
              >
                Compare
              </button>
            </div>

            {compareMutation.data && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <div className="mb-2">
                  <strong>Match Score:</strong>{' '}
                  <span className="text-2xl font-bold text-primary-600">
                    {compareMutation.data.matchScore}%
                  </span>
                </div>
                <div className="text-sm space-y-2">
                  <div>
                    <strong>Matching Skills:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {compareMutation.data.matchingSkills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-800 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong>Missing Skills:</strong>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {compareMutation.data.missingSkills?.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-100 text-red-800 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Cover Letter</h2>
            <button
              onClick={handleGenerateCoverLetter}
              disabled={
                !selectedResume ||
                !selectedJob ||
                coverLetterMutation.isPending
              }
              className="btn-secondary w-full mb-4"
            >
              {coverLetterMutation.isPending
                ? 'Generating...'
                : 'Generate Cover Letter'}
            </button>

            {coverLetterMutation.data && (
              <div className="p-4 bg-gray-50 rounded">
                <textarea
                  className="input-field"
                  rows={15}
                  value={coverLetterMutation.data.coverLetter}
                  readOnly
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 card">
        <h2 className="text-xl font-semibold mb-4">Saved Job Descriptions</h2>
        <div className="space-y-2">
          {jobs?.map((job) => (
            <div
              key={job.id}
              className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                setSelectedJob(job.id);
                setJobTitle(job.title);
                setCompany(job.company || '');
                setJobDescription(job.description);
              }}
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{job.title}</h3>
                  {job.company && (
                    <p className="text-sm text-gray-600">{job.company}</p>
                  )}
                </div>
                {job.matchScore && (
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary-600">
                      {Math.round(job.matchScore)}%
                    </span>
                    <p className="text-xs text-gray-500">Match</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobAnalyzer;
