import mongoose from 'mongoose';

const studyGroupSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  course: { type: String, required: true },
  meetingDay: String,
  meetingTime: String,
  location: String,
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  visibility: { type: String, enum: ['public', 'private', 'discoverable'], default: 'public' }
}, { timestamps: true });

// Auto-delete study groups 24 hours after creation
studyGroupSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('StudyGroup', studyGroupSchema);
