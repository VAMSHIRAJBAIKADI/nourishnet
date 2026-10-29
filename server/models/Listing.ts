import mongoose, { Schema, Document } from 'mongoose';
import { ListingStatus, StorageType } from '../types';

export interface IListingDocument extends Document {
  id: string;
  donor_id: string;
  donorId: string;
  donorName: string;
  donorVerified: boolean;
  title: string;
  description: string;
  category: string;
  storage_temp: string;
  storageType: StorageType;
  quantity_portions: number;
  quantity: string;
  estimatedMeals: number;
  weight_kg: number;
  weightKg: number;
  prepareTime: Date;
  expiry_timestamp: Date;
  expiryTime: Date;
  locationAddress: string;
  neighborhood: string;
  dietaryTags: string[];
  allergens: string[];
  pickupWindowStart: Date;
  pickupWindowEnd: Date;
  pickupInstructions: string;
  imageUrl?: string;
  status: ListingStatus;
  flagReason?: string;
  created_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListingDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    donor_id: { type: String, required: true, index: true },
    donorId: { type: String, index: true },
    donorName: { type: String, required: true },
    donorVerified: { type: Boolean, default: false },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    storage_temp: { type: String, default: 'Refrigerated' },
    storageType: { type: String, default: 'REFRIGERATED' },
    quantity_portions: { type: Number, default: 1 },
    quantity: { type: String, required: true },
    estimatedMeals: { type: Number, default: 1 },
    weight_kg: { type: Number, default: 1.0 },
    weightKg: { type: Number, default: 1.0 },
    prepareTime: { type: Date, default: Date.now },
    expiry_timestamp: { type: Date, required: true, index: true },
    expiryTime: { type: Date, index: true },
    locationAddress: { type: String, required: true },
    neighborhood: { type: String, default: 'Downtown' },
    dietaryTags: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
    pickupWindowStart: { type: Date, default: Date.now },
    pickupWindowEnd: { type: Date },
    pickupInstructions: { type: String, default: '' },
    imageUrl: { type: String },
    status: {
      type: String,
      required: true,
      enum: ['LIVE', 'CLAIMED', 'WITHDRAWN', 'AVAILABLE', 'REQUESTED', 'EXPIRED', 'CANCELLED', 'FLAGGED'],
      default: 'LIVE',
      index: true
    },
    flagReason: { type: String },
    created_at: { type: Date, default: Date.now }
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
