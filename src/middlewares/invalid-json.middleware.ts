import { ErrorRequestHandler } from 'express';

export const invalidJsonHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ message: 'Invalid JSON payload.' });
    return;
  }
  next(err);
};