import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AppError } from '../middleware/errorHandler.js';

// Ensure upload directories exist
const uploadDirs = [
  'uploads/events',
  'uploads/assignments',
  'uploads/marketplace',
  'uploads/profiles'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads/';
    if (file.fieldname === 'image' || file.fieldname === 'video') {
      dest += 'events';
    } else if (file.fieldname === 'marketplaceImages') {
      dest += 'marketplace';
    } else if (file.fieldname === 'profilePicture') {
      dest += 'profiles';
    } else if (file.fieldname === 'document') {
      if (req.originalUrl.includes('/submit') && req.user) {
        const program = req.user.program || 'General';
        const level = req.user.level || 'Level 1.1';
        const cleanProgram = program.replace(/[^a-zA-Z0-9\s-_]/g, '').trim() || 'General';
        const cleanLevel = level.replace(/[^a-zA-Z0-9\s-_]/g, '').trim() || 'Level 1.1';
        dest += `submissions/${cleanProgram}/${cleanLevel}`;
      } else {
        dest += 'assignments';
      }
    }
    
    // Ensure destination directory exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedImages = /jpeg|jpg|png|webp/;
  const allowedVideos = /mp4|webm|ogg/;
  const allowedDocs = /pdf|doc|docx|txt/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (file.fieldname === 'image' || file.fieldname === 'marketplaceImages' || file.fieldname === 'profilePicture') {
    if (allowedImages.test(extname) && allowedImages.test(mimetype)) {
      return cb(null, true);
    }
    return cb(new AppError('Only image files (jpeg, jpg, png, webp) are allowed!', 400), false);
  }

  if (file.fieldname === 'video') {
    if (allowedVideos.test(extname) && allowedVideos.test(mimetype)) {
      return cb(null, true);
    }
    return cb(new AppError('Only video files (mp4, webm, ogg) are allowed!', 400), false);
  }

  if (file.fieldname === 'document') {
    if (allowedDocs.test(extname) || allowedDocs.test(mimetype)) {
      return cb(null, true);
    }
    return cb(new AppError('Only document files (pdf, doc, docx, txt) are allowed!', 400), false);
  }

  cb(new AppError('Unknown field type for upload', 400), false);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB default limit
  }
});
