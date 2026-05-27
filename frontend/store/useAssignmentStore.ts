import { create } from 'zustand';
import { AssignmentStore, FormData } from '../types';

const initialFormData: FormData = {
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
};

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  formData: initialFormData,
  assignmentId: null,
  jobStatus: 'idle',
  jobStep: '',
  jobProgress: 0,
  paper: null,
  errorMessage: '',
  user: null,
  authStatus: 'idle',
  setFormData: (data) =>
    set((s) => ({
      formData: { ...s.formData, ...data },
    })),
  setAssignmentId: (id) => set({ assignmentId: id }),
  setJobStatus: (status, step = '', progress = 0) =>
    set({
      jobStatus: status,
      jobStep: step,
      jobProgress: progress,
    }),
  setPaper: (paper) => set({ paper }),
  setError: (msg) => set({ errorMessage: msg, jobStatus: 'error' }),
  resetJob: () =>
    set({
      formData: initialFormData,
      assignmentId: null,
      jobStatus: 'idle',
      jobStep: '',
      jobProgress: 0,
      paper: null,
      errorMessage: '',
    }),
  setUser: (user) => set({ user }),
  setAuthStatus: (authStatus) => set({ authStatus }),
}));
