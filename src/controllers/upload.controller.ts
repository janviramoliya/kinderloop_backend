import { Request, Response } from 'express';

export const uploadFile = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded.' });
    return;
  }
  res.status(200).json({ message: 'File uploaded successfully', file: req.file });
};