import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assignment', 
    required: true 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  document: { 
    type: String, 
    required: true 
  },
  fileMetadata: {
    filename: String,
    size: Number,
    mimetype: String
  },
  status: { 
    type: String, 
    enum: ['submitted', 'graded'], 
    default: 'submitted' 
  },
  grade: {
    type: String,
    default: ''
  },
  feedback: {
    type: String,
    default: ''
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);
