import { ErrorRequestHandler } from 'express';

export const multerErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ message: 'File too large. Max 2MB allowed.' });
    return;
  }
  if (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
    return;
  }
  next();
};
