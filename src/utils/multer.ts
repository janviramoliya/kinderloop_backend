import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from './apiError';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      throw new ApiError('Only images are allowed', 400);
    }
  }
});
