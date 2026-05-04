import multer from 'multer';
import path from 'path';
import { AppError } from './errorHandler.js';

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    if (file.fieldname === 'document') folder += 'assignments/';
    else if (file.fieldname === 'image' || file.fieldname === 'video') folder += 'events/';
    else if (file.fieldname === 'marketplaceImage') folder += 'marketplace/';
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter based on type
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    document: ['.pdf', '.docx', '.doc', '.pptx', '.pptx', '.xlsx', '.txt', '.zip'],
    image: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    video: ['.mp4', '.mov', '.avi'],
    marketplaceImage: ['.jpg', '.jpeg', '.png', '.webp']
  };

  const ext = path.extname(file.originalname).toLowerCase();
  const fieldAllowedTypes = allowedTypes[file.fieldname];

  if (fieldAllowedTypes && fieldAllowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new AppError(`Invalid file type for ${file.fieldname}. Allowed types: ${fieldAllowedTypes.join(', ')}`, 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max limit
  }
});

export const uploadAssignment = upload.single('document');
export const uploadEventMedia = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]);
export const uploadMarketplaceImage = upload.single('marketplaceImage');
