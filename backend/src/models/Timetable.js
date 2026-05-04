import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseTitle: { type: String, required: true },
  lecturer: String,
  venue: String,
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Timetable', timetableSchema);
