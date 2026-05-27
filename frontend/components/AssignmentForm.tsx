import React, { useState, useEffect } from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { submitAssignment } from '../lib/api';
import { useRouter } from 'next/navigation';
import { QuestionConfig } from '../types';

export function AssignmentForm() {
  const router = useRouter();
  const { formData, setFormData, setAssignmentId, setJobStatus, setError } = useAssignmentStore();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const gradeOptions = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12', 'Undergraduate', 'Postgraduate'
  ];

  const questionTypeOptions = [
    'Multiple Choice Questions',
    'Short Questions',
    'Diagram/Graph-Based Questions',
    'Numerical Problems',
    'Long Questions',
    'Fill in the Blanks',
    'True/False'
  ];

  // Sync totalMarks dynamically with marksConfig sum
  const calculatedTotalMarks = formData.marksConfig.reduce(
    (sum, item) => sum + item.count * item.marks,
    0
  );

  const calculatedTotalQuestions = formData.marksConfig.reduce(
    (sum, item) => sum + item.count,
    0
  );

  useEffect(() => {
    setFormData({ totalMarks: calculatedTotalMarks });
  }, [calculatedTotalMarks]);

  const handleInputChange = (field: string, value: any) => {
    setFormData({ [field]: value });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleRowChange = (index: number, key: keyof QuestionConfig, value: any) => {
    const newConfig = [...formData.marksConfig];
    newConfig[index] = {
      ...newConfig[index],
      [key]: value
    };
    setFormData({ marksConfig: newConfig });
  };

  const handleIncrement = (index: number, key: 'count' | 'marks') => {
    const currentValue = formData.marksConfig[index][key];
    handleRowChange(index, key, currentValue + 1);
  };

  const handleDecrement = (index: number, key: 'count' | 'marks') => {
    const currentValue = formData.marksConfig[index][key];
    if (currentValue > 0) {
      handleRowChange(index, key, currentValue - 1);
    }
  };

  const handleAddRow = () => {
    // Pick first option not currently fully in configs, or default
    const currentTypes = formData.marksConfig.map(c => c.type);
    const availableType = questionTypeOptions.find(t => !currentTypes.includes(t)) || questionTypeOptions[0];
    
    setFormData({
      marksConfig: [
        ...formData.marksConfig,
        { type: availableType, count: 5, marks: 2 }
      ]
    });
  };

  const handleRemoveRow = (index: number) => {
    const newConfig = formData.marksConfig.filter((_, i) => i !== index);
    setFormData({ marksConfig: newConfig });
  };

  const handleDifficultyChange = (level: 'easy' | 'medium' | 'hard', value: number) => {
    const nextDiff = {
      ...formData.difficulty,
      [level]: Math.max(0, Math.min(100, value)),
    };
    setFormData({ difficulty: nextDiff });
    if (errors.difficulty) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.difficulty;
        return next;
      });
    }
  };

  // Drag and Drop File Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedExtensions = /\.(pdf|txt|docx|png|jpg|jpeg)$/i;
    if (!allowedExtensions.test(file.name)) {
      setErrors((prev) => ({ ...prev, file: 'Invalid file type. Supports PDF, TXT, DOCX, PNG, JPG.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, file: 'File exceeds 10MB size limit.' }));
      return;
    }
    
    setFormData({ file });
    setErrors((prev) => {
      const next = { ...prev };
      delete next.file;
      return next;
    });
  };

  const handleReset = () => {
    setFormData({
      subject: '',
      grade: '',
      topic: '',
      dueDate: '',
      totalMarks: 60,
      questionTypes: ['Multiple Choice Questions', 'Short Questions'],
      marksConfig: [
        { type: 'Multiple Choice Questions', count: 4, marks: 1 },
        { type: 'Short Questions', count: 3, marks: 2 },
        { type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
        { type: 'Numerical Problems', count: 5, marks: 5 }
      ],
      difficulty: { easy: 30, medium: 50, hard: 20 },
      instructions: '',
      file: undefined,
    });
    setErrors({});
  };

  // Validate form frontend
  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.subject || formData.subject.trim().length < 2) {
      nextErrors.subject = 'Subject is required (minimum 2 characters).';
    }
    if (!formData.grade) {
      nextErrors.grade = 'Please select a grade/class.';
    }
    if (!formData.dueDate) {
      nextErrors.dueDate = 'Due date is required.';
    } else {
      const d = new Date(formData.dueDate);
      if (isNaN(d.getTime()) || d < new Date()) {
        nextErrors.dueDate = 'Due date must be a valid date in the future.';
      }
    }
    if (calculatedTotalMarks <= 0) {
      nextErrors.totalMarks = 'Total marks must be a positive integer.';
    }
    if (formData.marksConfig.length === 0) {
      nextErrors.marksConfig = 'Please add at least one question type row.';
    }

    // Check Difficulty Percentages
    const diffSum = formData.difficulty.easy + formData.difficulty.medium + formData.difficulty.hard;
    if (diffSum !== 100) {
      nextErrors.difficulty = `Difficulty percentages must sum to exactly 100%. Current sum: ${diffSum}%.`;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setJobStatus('pending', 'validating_config', 10);

    // Extract active question types (types with count > 0)
    const activeTypes = formData.marksConfig
      .filter(item => item.count > 0)
      .map(item => item.type);

    try {
      const payload = {
        ...formData,
        questionTypes: activeTypes,
        totalMarks: calculatedTotalMarks
      };

      const result = await submitAssignment(payload);
      setAssignmentId(result.assignmentId);
      setJobStatus('processing', 'queuing_job', 20);
      router.push(`/generating/${result.assignmentId}`);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to submit assignment. Please verify server connection.';
      setError(errMsg);
      setErrors((prev) => ({ ...prev, api: errMsg }));
      setIsSubmitting(false);
    }
  };

  const difficultySum = formData.difficulty.easy + formData.difficulty.medium + formData.difficulty.hard;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-16">
      
      {/* 1. Main Details container card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#E5E5EA] shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Assignment Details</h3>
          <p className="text-xs text-[#8E8E93] font-semibold mt-1">Basic information about your assignment</p>
        </div>

        {/* Upload Zone */}
        <div>
          <div
            className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition ${
              dragActive ? 'border-[#FF5A36] bg-[#FF5A36]/5' : 'border-[#E5E5EA] bg-[#F4F4F6] hover:bg-[#E9E9EB]'
            } ${errors.file ? 'border-red-400 bg-red-50/30' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <input
              id="file-upload-input"
              type="file"
              className="hidden"
              accept=".pdf,.txt,.docx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
            {/* Cloud Upload Icon */}
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-[#FF5A36] mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            {formData.file ? (
              <div className="text-center">
                <p className="text-sm font-bold text-[#FF5A36] truncate max-w-xs">{formData.file.name}</p>
                <p className="text-[10px] text-[#8E8E93] mt-1 font-semibold">
                  {(formData.file.size / (1024 * 1024)).toFixed(2)} MB · Click to change file
                </p>
              </div>
            ) : (
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-gray-800">Choose a file or drag & drop it here</p>
                <p className="text-[10px] text-[#8E8E93] font-semibold">PDF, TXT, DOCX, JPEG, PNG upto 10MB</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-[#8E8E93] mt-2 text-center font-semibold">
            Upload images or documents of your preferred source document/image
          </p>
          {errors.file && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.file}</p>}
        </div>

        {/* Due Date & General Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Subject / Course Name *</label>
            <input
              type="text"
              className={`w-full px-4 py-2.5 text-xs rounded-xl bg-[#F4F4F6] border focus:ring-2 focus:ring-[#FF5A36]/10 text-gray-900 outline-none transition ${
                errors.subject ? 'border-red-400 focus:border-red-400' : 'border-[#E5E5EA] focus:border-[#FF5A36]'
              }`}
              placeholder="e.g. Organic Chemistry, Ancient Civilizations"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
            />
            {errors.subject && <p className="mt-1 text-[10px] text-red-500 font-semibold">{errors.subject}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Target Grade / Education Level *</label>
            <select
              className={`w-full px-4 py-2.5 text-xs rounded-xl bg-[#F4F4F6] border focus:ring-2 focus:ring-[#FF5A36]/10 text-gray-900 outline-none transition ${
                errors.grade ? 'border-red-400 focus:border-red-400' : 'border-[#E5E5EA] focus:border-[#FF5A36]'
              }`}
              value={formData.grade}
              onChange={(e) => handleInputChange('grade', e.target.value)}
            >
              <option value="">Select Grade</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {errors.grade && <p className="mt-1 text-[10px] text-red-500 font-semibold">{errors.grade}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Topic or Chapter</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#F4F4F6] border border-[#E5E5EA] focus:ring-2 focus:ring-[#FF5A36]/10 focus:border-[#FF5A36] text-gray-900 outline-none transition"
              placeholder="e.g. Acids and Bases, French Revolution"
              value={formData.topic}
              onChange={(e) => handleInputChange('topic', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Due Date *</label>
            <div className="relative">
              <input
                type="date"
                className={`w-full px-4 py-2.5 text-xs rounded-xl bg-[#F4F4F6] border focus:ring-2 focus:ring-[#FF5A36]/10 text-gray-900 outline-none transition ${
                  errors.dueDate ? 'border-red-400 focus:border-red-400' : 'border-[#E5E5EA] focus:border-[#FF5A36]'
                }`}
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>
            {errors.dueDate && <p className="mt-1 text-[10px] text-red-500 font-semibold">{errors.dueDate}</p>}
          </div>
        </div>

        {/* Question Type Configuration Grid (Screenshot 3 Table) */}
        <div className="pt-4 border-t border-[#F4F4F6] space-y-4">
          <label className="block text-xs font-bold text-gray-700">Question Types & Counts</label>
          {errors.marksConfig && <p className="text-[10px] text-red-500 font-semibold">{errors.marksConfig}</p>}
          
          <div className="border border-[#E5E5EA] rounded-2xl overflow-hidden shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F4F4F6] border-b border-[#E5E5EA] text-[#8E8E93] text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 w-7/12">Question Type</th>
                    <th className="py-3 px-4 text-center w-2/12">No. of Questions</th>
                    <th className="py-3 px-4 text-center w-2/12">Marks</th>
                    <th className="py-3 px-4 text-center w-1/12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {formData.marksConfig.map((item, index) => (
                    <tr key={index} className="hover:bg-[#F9F9FB] transition">
                      <td className="py-3 px-4">
                        <select
                          className="w-full py-1.5 px-3 bg-[#F4F4F6] border border-[#E5E5EA] rounded-xl text-xs font-bold text-[#1C1C1E] focus:outline-none focus:border-[#FF5A36] transition"
                          value={item.type}
                          onChange={(e) => handleRowChange(index, 'type', e.target.value)}
                        >
                          {questionTypeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      
                      {/* Counter: No. of Questions */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center space-x-2 bg-[#F4F4F6] px-2.5 py-1 rounded-xl border border-[#E5E5EA] shadow-sm">
                          <button
                            type="button"
                            onClick={() => handleDecrement(index, 'count')}
                            className="w-5 h-5 bg-white text-[#8E8E93] hover:text-[#FF5A36] rounded-md font-bold text-xs flex items-center justify-center shadow-xs transition"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-gray-800 min-w-[16px]">{item.count}</span>
                          <button
                            type="button"
                            onClick={() => handleIncrement(index, 'count')}
                            className="w-5 h-5 bg-white text-[#8E8E93] hover:text-[#FF5A36] rounded-md font-bold text-xs flex items-center justify-center shadow-xs transition"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Counter: Marks */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center space-x-2 bg-[#F4F4F6] px-2.5 py-1 rounded-xl border border-[#E5E5EA] shadow-sm">
                          <button
                            type="button"
                            onClick={() => handleDecrement(index, 'marks')}
                            className="w-5 h-5 bg-white text-[#8E8E93] hover:text-[#FF5A36] rounded-md font-bold text-xs flex items-center justify-center shadow-xs transition"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-gray-800 min-w-[16px]">{item.marks}</span>
                          <button
                            type="button"
                            onClick={() => handleIncrement(index, 'marks')}
                            className="w-5 h-5 bg-white text-[#8E8E93] hover:text-[#FF5A36] rounded-md font-bold text-xs flex items-center justify-center shadow-xs transition"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Delete Row button */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          className="text-[#8E8E93] hover:text-red-500 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Table Footer: Add row & Sum calculations */}
            <div className="p-3 bg-[#F4F4F6] border-t border-[#E5E5EA] flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center space-x-1.5 bg-[#1C1C1E] text-white hover:bg-black py-1.5 px-3.5 rounded-xl border border-[#FF5A36] text-[10px] font-bold shadow-sm transition"
              >
                <span>+</span>
                <span>Add Question Type</span>
              </button>
              
              <div className="flex space-x-6 text-xs text-[#2C2C2C] font-bold mr-2">
                <div>
                  <span className="text-[#8E8E93] font-semibold">Total Questions : </span>
                  <span className="text-[#FF5A36]">{calculatedTotalQuestions}</span>
                </div>
                <div>
                  <span className="text-[#8E8E93] font-semibold">Total Marks : </span>
                  <span className="text-[#FF5A36]">{calculatedTotalMarks}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Difficulty mix card section */}
        <div className="pt-4 border-t border-[#F4F4F6] space-y-4">
          <label className="block text-xs font-bold text-gray-700">Difficulty Distribution Mix</label>
          {errors.difficulty && <p className="text-[10px] text-red-500 font-semibold">{errors.difficulty}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-[#F4F4F6] p-5 rounded-2xl border border-[#E5E5EA]">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-700">
                <span>Easy Questions</span>
                <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-200">{formData.difficulty.easy}%</span>
              </div>
              <input
                type="range"
                className="w-full accent-green-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                min="0"
                max="100"
                value={formData.difficulty.easy}
                onChange={(e) => handleDifficultyChange('easy', Number(e.target.value))}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-700">
                <span>Medium Questions</span>
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">{formData.difficulty.medium}%</span>
              </div>
              <input
                type="range"
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                min="0"
                max="100"
                value={formData.difficulty.medium}
                onChange={(e) => handleDifficultyChange('medium', Number(e.target.value))}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-700">
                <span>Hard Questions</span>
                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200">{formData.difficulty.hard}%</span>
              </div>
              <input
                type="range"
                className="w-full accent-red-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                min="0"
                max="100"
                value={formData.difficulty.hard}
                onChange={(e) => handleDifficultyChange('hard', Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-[#8E8E93] font-bold px-1">
            <span>Must sum up to exactly 100%</span>
            <span className={difficultySum === 100 ? 'text-green-600' : 'text-red-500'}>
              Current Sum: {difficultySum}%
            </span>
          </div>
        </div>

        {/* 3. Additional Instructions card section */}
        <div className="pt-4 border-t border-[#F4F4F6] space-y-2">
          <label className="block text-xs font-bold text-gray-700">Additional Information (For better output)</label>
          <div className="relative">
            <textarea
              rows={4}
              className="w-full px-4 py-3 text-xs rounded-2xl bg-[#F4F4F6] border border-[#E5E5EA] focus:ring-2 focus:ring-[#FF5A36]/10 focus:border-[#FF5A36] text-gray-900 outline-none transition placeholder-[#8E8E93] pr-10"
              placeholder="e.g. Generate a question paper for 3 hour exam duration..."
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
            />
            {/* Mic icon in bottom right */}
            <div className="absolute right-3.5 bottom-3.5 text-[#8E8E93] hover:text-[#FF5A36] cursor-pointer transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* API Submission Error */}
      {errors.api && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center space-x-3">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errors.api}</span>
        </div>
      )}

      {/* Form Action Buttons (Previous / Next) */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          className="flex items-center space-x-1.5 px-6 py-2.5 rounded-full border border-[#E5E5EA] bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Reset Config</span>
        </button>

        <button
          type="submit"
          className="flex items-center space-x-1 px-8 py-2.5 rounded-full bg-[#1C1C1E] text-white hover:bg-black text-xs font-bold shadow-md hover:shadow-lg transition disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              <span>Queuing Job...</span>
            </>
          ) : (
            <>
              <span>Next</span>
              <svg className="w-3.5 h-3.5 mt-0.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>

    </form>
  );
}
export default AssignmentForm;
