import { z } from "zod";
import { Router } from "express";
import { commentOnConfession, createConfession, deleteConfession, listConfessions, reactToConfession, reportConfession, shareConfession, toggleConfessionLike } from "../controllers/confession.controller";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const r = Router();

const createSchema = z.object({
	body: z.object({
		university: z.string().min(2),
		text: z.string().min(5).max(400),
		category: z.enum(["confession", "crush-story", "breakup", "funny", "library", "fest", "hostel"]).optional()
	}),
	query: z.object({}).optional(),
	params: z.object({}).optional()
});

const commentSchema = z.object({
	body: z.object({ text: z.string().min(1).max(240) }),
	query: z.object({}).optional(),
	params: z.object({ id: z.string().min(1) })
});

r.get("/", optionalAuth, listConfessions);
r.post("/", requireAuth, validate(createSchema), createConfession);
r.post("/:id/like", requireAuth, toggleConfessionLike);
r.post("/:id/comment", requireAuth, validate(commentSchema), commentOnConfession);
r.post("/:id/share", shareConfession);
r.post("/:id/report", requireAuth, reportConfession);
r.post("/:id/react", requireAuth, reactToConfession);
r.delete("/:id", requireAuth, deleteConfession);

export default r;
