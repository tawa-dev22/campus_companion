import mongoose from 'mongoose';

const marketplaceItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'general' },
  price: { type: Number, required: true },
  contact: { type: String, required: true },
  description: String,
  condition: { type: String, default: 'good' },
  location: String,
  status: { type: String, enum: ['active', 'sold', 'pending', 'removed'], default: 'active' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  images: [{ type: String }],
  filesMetadata: [{
    filename: String,
    size: Number,
    mimetype: String
  }]
}, { timestamps: true });

export default mongoose.model('MarketplaceItem', marketplaceItemSchema);
