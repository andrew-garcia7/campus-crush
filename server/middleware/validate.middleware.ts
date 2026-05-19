import { z } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const parsed = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.flatten()
    });
  }

  req.body = parsed.data.body;
  req.query = parsed.data.query;
  req.params = parsed.data.params;

  next();
};
