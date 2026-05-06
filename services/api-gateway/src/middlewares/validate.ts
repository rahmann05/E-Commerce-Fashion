import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

export const validate = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const details = error.details.map(detail => ({
        message: detail.message,
        path: detail.path
      }));
      return res.status(400).json({ success: false, error: 'Validation Failed', details });
    }

    req.body = value;
    next();
  };
};
