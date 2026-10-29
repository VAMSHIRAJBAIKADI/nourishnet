import mongoose, { Schema, Document } from 'mongoose';
import { RequestStatus } from '../types';

export interface IRequestDocument extends Document {
  id: string;
  listingId: string;
  listingTitle: string;
  donorId: string;
  donorName: string;
  recipientId: string;
  recipientName: string;
  recipientPhone: string;
  requestedMeals: number;
  pickupVolunteer: string;
  volunteerPhone: string;
  vehicleType: string;
  pickupTime: Date;
  notes?: string;
  status: RequestStatus;
  pickupCode: string;
  rejectionReason?: string;
  completedAt?: Date;
  timestamp: Date;
}

const RequestSchema = new Schema<IRequestDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    listingId: { type: String, required: true, index: true },
    listingTitle: { type: String, required: true },
    donorId: { type: String, required: true, index: true },
    donorName: { type: String, required: true },
    recipientId: { type: String, required: true, index: true },
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, default: '' },
    requestedMeals: { type: Number, required: true, min: 1 },
    pickupVolunteer: { type: String, required: true },
    volunteerPhone: { type: String, default: '' },
    vehicleType: { type: String, default: 'Standard Vehicle' },
    pickupTime: { type: Date, required: true },
    notes: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
      default: 'PENDING',
      index: true
    },
    pickupCode: { type: String, required: true },
    rejectionReason: { type: String },
    completedAt: { type: Date },
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

export const RequestModel = mongoose.models.Request || mongoose.model<IRequestDocument>('Request', RequestSchema);
