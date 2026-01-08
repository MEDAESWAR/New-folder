import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewApi, InterviewSession } from '../api/interview.api';

const InterviewPractice = () => {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');

  const { data: sessions } = useQuery({
    queryKey: ['interviews'],
    queryFn: interviewApi.getAll,
  });

  const { data: session } = useQuery({
    queryKey: ['interview', selectedSession],
    queryFn: () => interviewApi.getById(selectedSession!),
    enabled: !!selectedSession,
  });

  const createSessionMutation = useMutation({
    mutationFn: interviewApi.createSession,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      setSelectedSession(data.id);
      setJobTitle('');
      setCompany('');
      setJobDescription('');
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: ({
      id,
      questionIndex,
      answer,
    }: {
      id: string;
      questionIndex: number;
      answer: string;
    }) =>
      interviewApi.submitAnswer(id, {
        questionIndex,
        answer,
        jobDescription,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interview', selectedSession] });
      setAnswer('');
      if (session && currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => interviewApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      queryClient.invalidateQueries({ queryKey: ['interview', selectedSession] });
    },
  });

  const handleCreateSession = () => {
    if (!jobTitle.trim()) return;
    createSessionMutation.mutate({
      jobTitle,
      company: company || undefined,
      jobDescription: jobDescription || undefined,
    });
  };

  const handleSubmitAnswer = () => {
    if (!selectedSession || !answer.trim()) return;
    submitAnswerMutation.mutate({
      id: selectedSession,
      questionIndex: currentQuestionIndex,
      answer,
    });
  };

  const handleComplete = () => {
    if (!selectedSession) return;
    completeMutation.mutate(selectedSession);
  };

  const currentQuestion = session?.questions[currentQuestionIndex];
  const currentFeedback =
    session?.feedback && (session.feedback as any)[currentQuestionIndex];

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Interview Practice</h1>
        <p className="mt-2 text-gray-600">
          Practice interviews with AI-generated questions and feedback
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {!selectedSession ? (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">
                Create Interview Session
              </h2>
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
                    Company (optional)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
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
                    placeholder="Paste job description for more relevant questions..."
                  />
                </div>
                <button
                  onClick={handleCreateSession}
                  disabled={createSessionMutation.isPending || !jobTitle.trim()}
                  className="btn-primary w-full"
                >
                  {createSessionMutation.isPending
                    ? 'Creating...'
                    : 'Start Interview Practice'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {currentQuestion && (
                <div className="card">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">Question</h3>
                      <span className="text-sm text-gray-500">
                        {currentQuestionIndex + 1} / {session?.questions.length}
                      </span>
                    </div>
                    <p className="text-gray-700">{currentQuestion.question}</p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer
                    </label>
                    <textarea
                      className="input-field"
                      rows={6}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={
                        submitAnswerMutation.isPending || !answer.trim()
                      }
                      className="btn-primary"
                    >
                      {submitAnswerMutation.isPending
                        ? 'Submitting...'
                        : 'Submit Answer'}
                    </button>
                    {currentQuestionIndex > 0 && (
                      <button
                        onClick={() => {
                          setCurrentQuestionIndex(currentQuestionIndex - 1);
                          setAnswer('');
                        }}
                        className="btn-secondary"
                      >
                        Previous
                      </button>
                    )}
                    {session &&
                      currentQuestionIndex < session.questions.length - 1 && (
                        <button
                          onClick={() => {
                            setCurrentQuestionIndex(currentQuestionIndex + 1);
                            setAnswer('');
                          }}
                          className="btn-secondary"
                        >
                          Next
                        </button>
                      )}
                  </div>

                  {currentFeedback && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <div className="mb-2">
                        <strong>Score:</strong>{' '}
                        <span className="text-xl font-bold text-primary-600">
                          {currentFeedback.score}/100
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        {currentFeedback.strengths &&
                          currentFeedback.strengths.length > 0 && (
                            <div>
                              <strong>Strengths:</strong>
                              <ul className="list-disc list-inside text-gray-700">
                                {currentFeedback.strengths.map(
                                  (strength: string, idx: number) => (
                                    <li key={idx}>{strength}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        {currentFeedback.improvements &&
                          currentFeedback.improvements.length > 0 && (
                            <div>
                              <strong>Improvements:</strong>
                              <ul className="list-disc list-inside text-gray-700">
                                {currentFeedback.improvements.map(
                                  (improvement: string, idx: number) => (
                                    <li key={idx}>{improvement}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        {currentFeedback.suggestedAnswer && (
                          <div>
                            <strong>Suggested Answer:</strong>
                            <p className="text-gray-700 mt-1">
                              {currentFeedback.suggestedAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {session &&
                currentQuestionIndex === session.questions.length - 1 &&
                session.questions.every((q) => q.answer) && (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-4">
                      Interview Complete!
                    </h3>
                    {session.score && (
                      <div className="mb-4">
                        <strong>Overall Score:</strong>{' '}
                        <span className="text-2xl font-bold text-primary-600">
                          {Math.round(session.score)}/100
                        </span>
                      </div>
                    )}
                    <button
                      onClick={handleComplete}
                      disabled={completeMutation.isPending}
                      className="btn-primary"
                    >
                      {completeMutation.isPending
                        ? 'Completing...'
                        : 'Complete Interview'}
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <h3 className="font-semibold mb-3">Interview Sessions</h3>
            <div className="space-y-2">
              {sessions?.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSession(s.id);
                    setCurrentQuestionIndex(0);
                    setAnswer('');
                  }}
                  className={`w-full text-left p-3 rounded ${
                    selectedSession === s.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50 border'
                  }`}
                >
                  <div className="font-medium">{s.jobTitle}</div>
                  {s.company && (
                    <div className="text-sm text-gray-600">{s.company}</div>
                  )}
                  {s.score && (
                    <div className="text-sm text-primary-600 mt-1">
                      Score: {Math.round(s.score)}/100
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPractice;
