import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resumeApi, Resume } from '../api/resume.api';

const ResumeBuilder = () => {
  const queryClient = useQueryClient();
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Resume>>({
    title: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
  });

  const { data: resumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: resumeApi.getAll,
  });

  const { data: resume } = useQuery({
    queryKey: ['resume', selectedResume],
    queryFn: () => resumeApi.getById(selectedResume!),
    enabled: !!selectedResume,
  });

  // Load resume data into form when selected
  useEffect(() => {
    if (resume) {
      setFormData(resume);
    } else if (selectedResume === null) {
      // Reset form when no resume is selected
      setFormData({
        title: '',
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: [],
      });
    }
  }, [resume, selectedResume]);

  const createMutation = useMutation({
    mutationFn: resumeApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setSelectedResume(data.id);
      setFormData(data);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create resume');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Resume> }) =>
      resumeApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['resume', selectedResume] });
      alert('Resume updated successfully!');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to update resume');
    },
  });

  const improveBulletMutation = useMutation({
    mutationFn: ({ bullet, context }: { bullet: string; context?: string }) =>
      resumeApi.improveBullet(bullet, context),
  });

  const handleSave = () => {
    if (!formData.title?.trim()) {
      alert('Please enter a resume title');
      return;
    }
    if (selectedResume) {
      updateMutation.mutate({ id: selectedResume, data: formData });
    } else {
      createMutation.mutate(formData as Resume);
    }
  };

  const handleImproveBullet = async (bullet: string) => {
    const result = await improveBulletMutation.mutateAsync({
      bullet,
      context: formData.summary,
    });
    return result.improved;
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...(formData.experience || []),
        { title: '', company: '', duration: '', description: [] },
      ],
    });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...(formData.education || []),
        { degree: '', institution: '', year: '' },
      ],
    });
  };

  const addSkill = () => {
    setFormData({
      ...formData,
      skills: [...(formData.skills || []), ''],
    });
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
        <p className="mt-2 text-gray-600">
          Create and optimize your ATS-friendly resume
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Title
              </label>
              <input
                type="text"
                className="input-field"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Software Engineer Resume"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Summary
              </label>
              <textarea
                className="input-field"
                rows={4}
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                placeholder="Write a compelling professional summary..."
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Experience
                </label>
                <button
                  onClick={addExperience}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add
                </button>
              </div>
              {(formData.experience || []).map((exp, idx) => (
                <div key={idx} className="mb-3 p-3 border rounded">
                  <input
                    type="text"
                    className="input-field mb-2"
                    placeholder="Job Title"
                    value={exp.title || ''}
                    onChange={(e) => {
                      const newExp = [...(formData.experience || [])];
                      newExp[idx] = { ...exp, title: e.target.value };
                      setFormData({ ...formData, experience: newExp });
                    }}
                  />
                  <input
                    type="text"
                    className="input-field mb-2"
                    placeholder="Company"
                    value={exp.company || ''}
                    onChange={(e) => {
                      const newExp = [...(formData.experience || [])];
                      newExp[idx] = { ...exp, company: e.target.value };
                      setFormData({ ...formData, experience: newExp });
                    }}
                  />
                  <textarea
                    className="input-field"
                    rows={2}
                    placeholder="Description (one per line)"
                    value={
                      Array.isArray(exp.description)
                        ? exp.description.join('\n')
                        : ''
                    }
                    onChange={(e) => {
                      const newExp = [...(formData.experience || [])];
                      newExp[idx] = {
                        ...exp,
                        description: e.target.value.split('\n'),
                      };
                      setFormData({ ...formData, experience: newExp });
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Education
                </label>
                <button
                  onClick={addEducation}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add
                </button>
              </div>
              {(formData.education || []).map((edu, idx) => (
                <div key={idx} className="mb-3 p-3 border rounded">
                  <input
                    type="text"
                    className="input-field mb-2"
                    placeholder="Degree"
                    value={edu.degree || ''}
                    onChange={(e) => {
                      const newEdu = [...(formData.education || [])];
                      newEdu[idx] = { ...edu, degree: e.target.value };
                      setFormData({ ...formData, education: newEdu });
                    }}
                  />
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Institution"
                    value={edu.institution || ''}
                    onChange={(e) => {
                      const newEdu = [...(formData.education || [])];
                      newEdu[idx] = { ...edu, institution: e.target.value };
                      setFormData({ ...formData, education: newEdu });
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Skills
                </label>
                <button
                  onClick={addSkill}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(formData.skills || []).map((skill, idx) => (
                  <input
                    key={idx}
                    type="text"
                    className="input-field flex-1 min-w-[150px]"
                    placeholder="Skill"
                    value={skill}
                    onChange={(e) => {
                      const newSkills = [...(formData.skills || [])];
                      newSkills[idx] = e.target.value;
                      setFormData({ ...formData, skills: newSkills });
                    }}
                  />
                ))}
              </div>
            </div>

            <button onClick={handleSave} className="btn-primary">
              {selectedResume ? 'Update Resume' : 'Create Resume'}
            </button>
          </div>
        </div>

        <div>
          <div className="card mb-4">
            <h3 className="font-semibold mb-3">Your Resumes</h3>
            <div className="space-y-2">
              {resumes?.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedResume(r.id);
                    setFormData(r);
                  }}
                  className={`w-full text-left p-2 rounded ${
                    selectedResume === r.id
                      ? 'bg-primary-50 border border-primary-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {r.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
