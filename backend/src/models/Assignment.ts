import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  subject: string;
  grade: string;
  topic: string;
  dueDate: Date;
  totalMarks: number;
  questionTypes: string[];           // ['MCQ', 'Short answer', 'Long answer']
  marksConfig: {
    mcq: { count: number; marks: number };
    short: { count: number; marks: number };
    long: { count: number; marks: number };
  };
  difficulty: {
    easy: number;    // percentage
    medium: number;
    hard: number;
  };
  instructions: string;
  referenceText?: string;            // extracted text from uploaded file
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  topic: { type: String, required: true },
  dueDate: { type: Date, required: true },
  totalMarks: { type: Number, required: true, min: 1 },
  questionTypes: [{ type: String }],
  marksConfig: { type: Schema.Types.Mixed, required: true },
  difficulty: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },
  instructions: String,
  referenceText: String,
  status: { type: String, enum: ['pending','processing','done','error'], default: 'pending' },
  errorMessage: String,
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false }
}, { timestamps: true });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
