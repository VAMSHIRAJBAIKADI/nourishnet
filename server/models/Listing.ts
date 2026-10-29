import mongoose, { Schema, Document } from 'mongoose';
import { ListingStatus, StorageType } from '../types';

export interface IListingDocument extends Document {
  id: string;
  donorId: string;
  donorName: string;
  donorVerified: boolean;
  title: string;
  description: string;
  category: string;
  quantity: string;
  estimatedMeals: number;
  weightKg: number;
  prepareTime: Date;
  expiryTime: Date;
  locationAddress: string;
  neighborhood: string;
  storageType: StorageType;
  dietaryTags: string[];
  allergens: string[];
  pickupWindowStart: Date;
  pickupWindowEnd: Date;
  pickupInstructions: string;
  imageUrl?: string;
  status: ListingStatus;
  flagReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListingDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    donorId: { type: String, required: true, index: true },
    donorName: { type: String, required: true },
    donorVerified: { type: Boolean, default: false },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    quantity: { type: String, required: true },
    estimatedMeals: { type: Number, default: 1 },
    weightKg: { type: Number, default: 1.0 },
    prepareTime: { type: Date, default: Date.now },
    expiryTime: { type: Date, required: true, index: true },
    locationAddress: { type: String, required: true },
    neighborhood: { type: String, default: 'Downtown' },
    storageType: {
      type: String,
      required: true,
      enum: ['REFRIGERATED', 'FROZEN', 'AMBIENT', 'HOT_HOLD'],
      default: 'REFRIGERATED'
    },
    dietaryTags: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
    pickupWindowStart: { type: Date, default: Date.now },
    pickupWindowEnd: { type: Date, required: true },
    pickupInstructions: { type: String, default: '' },
    imageUrl: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['AVAILABLE', 'REQUESTED', 'CLAIMED', 'EXPIRED', 'CANCELLED', 'FLAGGED'],
      default: 'AVAILABLE',
      index: true
    },
    flagReason: { type: String }
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

export const ListingModel = mongoose.models.Listing || mongoose.model<IListingDocument>('Listing', ListingSchema);
