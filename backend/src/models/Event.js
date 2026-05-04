import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'general' },
  date: { type: Date, required: true },
  venue: String,
  description: String,
  image: { type: String },
  video: { type: String },
  fileMetadata: {
    filename: String,
    size: Number,
    mimetype: String
  }
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
