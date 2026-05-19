import { Request, Response, NextFunction } from "express";

const buckets = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = (limit = 120, windowMs = 60_000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= limit) {
      return res.status(429).json({ success: false, message: "Too many requests. Please try again shortly." });
    }

    bucket.count += 1;
    next();
  };
};
