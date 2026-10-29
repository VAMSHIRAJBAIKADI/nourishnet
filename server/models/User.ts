import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, VerifiedStatus, OrganizationDetails } from '../types';

export interface IUserDocument extends Document {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  passwordHash?: string;
  role: UserRole;
  organizationName?: string;
  organizationDetails: OrganizationDetails;
  verified_status: VerifiedStatus;
  verifiedStatus?: VerifiedStatus;
  created_at: Date;
  createdAt?: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password_hash: { type: String, required: true },
    passwordHash: { type: String },
    role: {
      type: String,
      required: true,
      enum: ['DONOR', 'RECIPIENT', 'RECIPIENT_NGO', 'ADMIN'],
      index: true
    },
    organizationName: { type: String, trim: true },
    organizationDetails: { type: Schema.Types.Mixed, default: {} },
    verified_status: {
      type: String,
      required: true,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    verifiedStatus: { type: String },
    created_at: { type: Date, default: Date.now },
    createdAt: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).password_hash;
        delete (ret as any).passwordHash;
        return ret;
      }
    }
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
