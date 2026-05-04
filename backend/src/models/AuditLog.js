import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  module: {
    type: String,
    required: true,
    enum: ['auth', 'users', 'roles', 'timetable', 'assignments', 'events', 'marketplace', 'study_groups'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: String,
  userAgent: String,
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model('AuditLog', auditLogSchema);
