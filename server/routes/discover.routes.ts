import { z } from "zod";
import { Router } from "express";
import { discoverUsers, swipeUser } from "../controllers/discover.controller";
import { validate } from "../middleware/validate.middleware";
import { requireAuth, requireVerified } from "../middleware/auth.middleware";

const r = Router();

const querySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({ university: z.string().min(2) }),
  params: z.object({}).optional()
});

const actionSchema = z.object({
  body: z.object({ toUserId: z.string().min(1), action: z.enum(["like", "dislike", "superlike", "rose", "compliment"]) }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

r.get("/", requireAuth, requireVerified, validate(querySchema), discoverUsers);
r.post("/swipe", requireAuth, requireVerified, validate(actionSchema), swipeUser);

export default r;

