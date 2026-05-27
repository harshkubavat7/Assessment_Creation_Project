export interface Question {
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  options?: string[];
  answer?: string;
}

export interface Section {
  title: string;
  type: string;
  instruction: string;
  questions: Question[];
}

export interface QuestionPaper {
  _id: string;
  assignmentId: string;
  sections: Section[];
  generatedAt: string;
}

export interface QuestionConfig {
  type: string;
  count: number;
  marks: number;
}

export interface FormData {
  subject: string;
  grade: string;
  topic: string;
  dueDate: string;
  totalMarks: number;
  questionTypes: string[];
  marksConfig: QuestionConfig[];
  difficulty: { easy: number; medium: number; hard: number };
  instructions: string;
  file?: File;
}
export interface UserProfile {
  email: string;
  schoolName: string;
  schoolLocation: string;
}

export interface AssignmentStore {
  formData: FormData;
  assignmentId: string | null;
  jobStatus: 'idle' | 'pending' | 'processing' | 'done' | 'error';
  jobStep: string;
  jobProgress: number;
  paper: QuestionPaper | null;
  errorMessage: string;
  user: UserProfile | null;
  authStatus: 'idle' | 'checking' | 'authenticated' | 'unauthenticated';
  setFormData: (data: Partial<FormData>) => void;
  setAssignmentId: (id: string | null) => void;
  setJobStatus: (status: AssignmentStore['jobStatus'], step?: string, progress?: number) => void;
  setPaper: (paper: QuestionPaper | null) => void;
  setError: (msg: string) => void;
  resetJob: () => void;
  setUser: (user: UserProfile | null) => void;
  setAuthStatus: (status: AssignmentStore['authStatus']) => void;
}
