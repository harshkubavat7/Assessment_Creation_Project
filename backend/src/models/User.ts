import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  schoolName: string;
  schoolLocation: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  schoolName: { type: String, required: true },
  schoolLocation: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
