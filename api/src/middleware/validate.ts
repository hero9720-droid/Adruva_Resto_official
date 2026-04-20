import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../lib/errors';

export const validateBody = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string> = {};
        error.errors.forEach(err => {
          details[err.path.join('.')] = err.message;
        });
        throw new AppError(400, 'Validation Error', 'VALIDATION_ERROR', details);
      }
      next(error);
    }
  };
