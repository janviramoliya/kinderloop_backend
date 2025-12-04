import { Response } from 'express';

type ResponseType<T> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
};

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: ResponseType<T>
) => {
  res.status(statusCode).json({
    success: payload.success,
    message: payload.message,
    data: payload.data,
    errors: payload.errors,
  });
};