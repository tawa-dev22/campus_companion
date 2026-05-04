import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission'
  }],
  isStatic: {
    type: Boolean,
    default: false, // Static roles like Super Admin cannot be deleted
  }
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
