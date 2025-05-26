'use client'

import { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';

export default function ResumeForm({ initialData, onSuccess }) {
  const defaultFormData = {
    name: '',
    contact: {
      email: '',
      phone: '',
      location: ''
    },
    summary: '',
    skills: [],
    experience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: ['']
    }],
    education: [{
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: ''
    }],
    projects: [{
      name: '',
      description: '',
      technologies: [],
      url: ''
    }],
    certifications: [{
      name: '',
      issuer: '',
      date: '',
      url: ''
    }]
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      // Merge initialData with defaultFormData to ensure all fields exist
      setFormData(prevData => ({
        ...defaultFormData,
        ...initialData,
        contact: {
          ...defaultFormData.contact,
          ...(initialData.contact || {})
        },
        experience: initialData.experience || defaultFormData.experience,
        education: initialData.education || defaultFormData.education,
        projects: initialData.projects || defaultFormData.projects,
        certifications: initialData.certifications || defaultFormData.certifications
      }));
    }
  }, [initialData]);

  const handleArrayChange = (field, index, key, value) => {
    setFormData(prevData => {
      const newArray = [...prevData[field]];
      newArray[index] = { ...newArray[index], [key]: value };
      return { ...prevData, [field]: newArray };
    });
  };

  const addEntry = (field) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: [...prevData[field], { ...defaultFormData[field][0] }]
    }));
  };

  const removeEntry = (field, index) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: prevData[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user found');

      await setDoc(doc(db, 'resumes', user.uid), {
        ...formData,
        lastUpdated: new Date().toISOString(),
        version: (formData.version || 0) + 1
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving resume:', error);
      alert('Error saving resume. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Skills Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Skills</h3>
        {formData.skills.map((skill, index) => (
          <input
            key={index}
            value={skill}
            onChange={(e) => {
              const newSkills = [...formData.skills];
              newSkills[index] = e.target.value;
              setFormData({ ...formData, skills: newSkills });
            }}
            className="w-full p-2 border rounded mb-2"
          />
        ))}
        <button
          type="button"
          onClick={() => setFormData({ ...formData, skills: [...formData.skills, ''] })}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          + Add Skill
        </button>
      </div>

      {/* Experience Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Experience</h3>
        {formData.experience.map((exp, index) => (
          <div key={index} className="mb-4 space-y-2">
            <input
              placeholder="Company"
              value={exp.company}
              onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
              className="w-full p-2 border rounded"
            />
            {/* Add other experience fields similarly */}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addEntry('experience')}
          className="bg-gray-200 px-3 py-1 rounded"
        >
          + Add Experience
        </button>
      </div>

      <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded">
        Save Resume
      </button>
    </form>
  );
}