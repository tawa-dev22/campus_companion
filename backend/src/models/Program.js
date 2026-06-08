import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  code: { type: String, trim: true }
}, { timestamps: true });

export default mongoose.model('Program', programSchema);
