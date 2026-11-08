import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateBody =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed.",
        fields: z.flattenError(result.error).fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };

export const validateQuery =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed.",
        fields: z.flattenError(result.error).fieldErrors,
      });
    }

    req.validatedQuery = result.data;
    next();
  };

export const validateParams =
  (schema: z.ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        error: "Validation failed.",
        fields: z.flattenError(result.error).fieldErrors,
      });
    }

    req.validatedParams = result.data;
    next();
  };
