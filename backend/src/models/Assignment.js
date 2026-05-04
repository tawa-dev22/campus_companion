import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  module: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'submitted'], default: 'pending' },
  notes: String,
  document: { type: String },
  fileMetadata: {
    filename: String,
    size: Number,
    mimetype: String
  }
}, { timestamps: true });

export default mongoose.model('Assignment', assignmentSchema);
