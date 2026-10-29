import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, VerifiedStatus, OrganizationDetails } from '../types';

export interface IUserDocument extends Document {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  organizationDetails: OrganizationDetails;
  verifiedStatus: VerifiedStatus;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['DONOR', 'RECIPIENT', 'ADMIN'], index: true },
    name: { type: String, required: true, trim: true },
    organizationDetails: { type: Schema.Types.Mixed, default: {} },
    verifiedStatus: { type: String, required: true, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).passwordHash;
        return ret;
      }
    }
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
