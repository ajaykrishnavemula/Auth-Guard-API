import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ipAddress: string;
  userAgent: string;
  location?: string;
  details?: Record<string, any>;
  status: 'success' | 'failure';
  timestamp: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info',
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Indexes for efficient querying
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ severity: 1, timestamp: -1 });
activitySchema.index({ action: 1, timestamp: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);


