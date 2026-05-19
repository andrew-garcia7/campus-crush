import { z } from "zod";
import { Router } from "express";
import { cupidCoach, helpNow } from "../controllers/ai.controller";
import { validate } from "../middleware/validate.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";

const r = Router();

const aiSchema = z.object({
  body: z.object({ prompt: z.string().min(2) }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

r.use(rateLimit(30, 60_000));
r.post("/coach", validate(aiSchema), cupidCoach);
r.post("/help-now", validate(aiSchema), helpNow);

export default r;
