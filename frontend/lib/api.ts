import axios from 'axios';
import type { FormData as AssignmentFormData } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create AXIOS instance configured for transporting session cookies
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication API Requests
export const signupTeacher = async (payload: any) => {
  const response = await api.post('/auth/signup', payload);
  return response.data;
};

export const loginTeacher = async (payload: any) => {
  const response = await api.post('/auth/login', payload);
  return response.data;
};

export const logoutTeacher = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Assignment API Requests
export const submitAssignment = async (formData: AssignmentFormData) => {
  const data = new window.FormData();
  
  // Format body
  const bodyData = {
    subject: formData.subject,
    grade: formData.grade,
    topic: formData.topic,
    dueDate: formData.dueDate,
    totalMarks: formData.totalMarks,
    questionTypes: formData.questionTypes,
    marksConfig: formData.marksConfig,
    difficulty: formData.difficulty,
    instructions: formData.instructions,
  };

  data.append('data', JSON.stringify(bodyData));
  
  if (formData.file) {
    data.append('file', formData.file);
  }

  // Use the preconfigured api instance (transports cookie and multipart headers)
  const response = await api.post('/assignments', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data; // returns { assignmentId: string }
};

export const getAssignments = async () => {
  const response = await api.get('/assignments');
  return response.data;
};

export const getAssignment = async (id: string) => {
  const response = await api.get(`/assignments/${id}`);
  return response.data;
};

export const getPaper = async (id: string) => {
  const response = await api.get(`/assignments/${id}/paper`);
  return response.data;
};

export const deleteAssignment = async (id: string) => {
  const response = await api.delete(`/assignments/${id}`);
  return response.data;
};

export const regeneratePaper = async (id: string) => {
  const response = await api.post(`/assignments/${id}/regenerate`);
  return response.data;
};

// Dashboard Stats API Request
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

// Groups API Requests
export const getGroups = async () => {
  const response = await api.get('/groups');
  return response.data;
};

export const createGroup = async (payload: any) => {
  const response = await api.post('/groups', payload);
  return response.data;
};

export const deleteGroup = async (id: string) => {
  const response = await api.delete(`/groups/${id}`);
  return response.data;
};

export const generateToolkitItem = async (toolType: string, payload: any) => {
  const response = await api.post('/toolkit/generate', { toolType, payload });
  return response.data;
};
