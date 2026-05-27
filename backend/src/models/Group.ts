import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  students: number;
  department: string;
  average: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true },
  students: { type: Number, default: 0 },
  department: { type: String, required: true },
  average: { type: String, default: 'N/A' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<IGroup>('Group', GroupSchema);
