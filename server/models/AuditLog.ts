import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: 'LISTING' | 'USER' | 'REQUEST';
  targetId: string;
  details: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    adminId: { type: String, required: true, index: true },
    adminName: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true, enum: ['LISTING', 'USER', 'REQUEST'] },
    targetId: { type: String, required: true, index: true },
    details: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      }
    }
  }
);

export const AuditLogModel = mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
