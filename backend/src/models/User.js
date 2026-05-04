import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    dateOfBirth: { type: Date },
    address: { type: String, trim: true },
    bio: { type: String, maxLength: 500 },
    studentId: { type: String, trim: true },
    staffId: { type: String, trim: true },
    department: { type: String, trim: true },
    program: { type: String, trim: true }, // e.g. B.Sc Computer Science
    level: { type: String, trim: true },    // e.g. Year 2, Semester 1
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    profilePicture: { type: String },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    refreshToken: { type: String },
    lastLogin: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
