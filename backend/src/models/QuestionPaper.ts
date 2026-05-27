import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  options?: string[];   // for MCQ
  answer?: string;      // correct option or model answer
}

export interface ISection {
  title: string;        // 'Section A'
  type: string;         // 'MCQ', 'Short answer', etc.
  instruction: string;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  sections: ISection[];
  generatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy','Medium','Hard'], required: true },
  marks: { type: Number, required: true },
  options: [String],
  answer: { type: String, default: '' },
});

const SectionSchema = new Schema<ISection>({
  title: String,
  type: String,
  instruction: String,
  questions: [QuestionSchema],
});

const QuestionPaperSchema = new Schema<IQuestionPaper>({
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true },
  sections: [SectionSchema],
  generatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IQuestionPaper>('QuestionPaper', QuestionPaperSchema);
