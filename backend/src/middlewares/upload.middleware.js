import multer from 'multer';
import { sendError } from '../utils/responseHelper.js';

// Memory storage keeps files as Buffer objects in memory
const storage = multer.memoryStorage();

// Validate file types to accept only image formats
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only images are allowed!'), false);
  }
};

// Set up Multer instance with 5MB max size
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter
});

/**
 * Express error handling wrapper for Multer limits and exceptions
 */
export const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, 'File upload failed. Max file size limit is 5MB.');
    }
    return sendError(res, 400, `Upload error: ${err.message}`);
  } else if (err) {
    return sendError(res, 400, err.message);
  }
  next();
};
