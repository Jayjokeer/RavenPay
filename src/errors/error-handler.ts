import { Request, Response, NextFunction } from 'express';
import AppError from './error';



export const catchAsync = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err: any) => next(err)); 
  };
};
const globalErrorHandler = (
  err: AppError, 
  req: Request, 
  res: Response, 
  next: NextFunction 
) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    code: err.statusCode,
    status: err.status,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export default globalErrorHandler;