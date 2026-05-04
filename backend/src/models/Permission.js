import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: ['user_management', 'content_management', 'system_config', 'marketplace', 'general'],
    default: 'general',
  }
}, { timestamps: true });

export default mongoose.model('Permission', permissionSchema);
