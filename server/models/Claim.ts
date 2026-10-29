import mongoose, { Schema, Document } from 'mongoose';
import { ClaimStatus } from '../types';

export interface IClaimDocument extends Document {
  id: string;
  listing_id: string;
  recipient_id: string;
  status: ClaimStatus;
  claimed_at: Date;
  notes?: string;
  listingTitle?: string;
  donorId?: string;
  donorName?: string;
  recipientName?: string;
}

const ClaimSchema = new Schema<IClaimDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    listing_id: { type: String, required: true, index: true },
    recipient_id: { type: String, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true
    },
    claimed_at: { type: Date, default: Date.now },
    notes: { type: String },
    listingTitle: { type: String },
    donorId: { type: String },
    donorName: { type: String },
    recipientName: { type: String }
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

export const ClaimModel = mongoose.models.Claim || mongoose.model<IClaimDocument>('Claim', ClaimSchema);
