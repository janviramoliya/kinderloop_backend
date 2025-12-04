import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    // contactId: { type: 'string', required: true },
    name: { type: 'string', required: true },
    email: { type: 'string', required: true },
    phone: { type: 'string', required: true },
    subject: { type: 'string', required: true },
    message: { type: 'string', required: true },
    status: {
      type: 'string',
      enum: ['pending', 'in_progress', 'resolved', 'closed'],
      required: true,
      default: 'pending'
    },
    priority: {
      type: 'string',
      enum: ['low', 'medium', 'high', 'urgent'],
      required: true,
      default: 'medium'
    },
    assignedTo: {
      type: 'string',
      required: false // Admin user ID who is handling the inquiry
    },
    response: {
      type: 'string',
      required: false // Admin response to the inquiry
    },
    respondedAt: { type: 'string', required: false },
    respondedBy: {
      type: 'string',
      required: false // Admin user ID who responded
    },
    isRead: { type: 'boolean', required: true, default: false },
    source: {
      type: 'string',
      enum: ['website', 'mobile_app', 'phone', 'email'],
      required: true,
      default: 'website'
    },
    category: {
      type: 'string',
      enum: ['general', 'support', 'complaint', 'suggestion', 'business'],
      required: true,
      default: 'general'
    },
    userAgent: {
      type: 'string',
      required: false // Browser/device information
    },
    ipAddress: { type: 'string', required: false }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('contact', contactSchema);

export type ContactStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';
export type ContactPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ContactSource = 'website' | 'mobile_app' | 'phone' | 'email';
export type ContactCategory = 'general' | 'support' | 'complaint' | 'suggestion' | 'business';
