import { z } from "zod";
import { Router } from "express";
import { getProfile, googleLogin, login, register, updateProfile } from "../controllers/auth.controller";
import { handleGoogleCallback, startGoogleOAuth } from "../controllers/auth.google.controller";
import { validate } from "../middleware/validate.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const r = Router();

const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().trim().min(6),
    university: z.string().min(2)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().min(1),
    password: z.string().trim().min(1)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

const profileSchema = z.object({
  body: z.object({
    age: z.number().min(18).max(99).optional(),
    bio: z.string().max(200).optional(),
    university: z.string().min(2).optional(),
    department: z.string().max(120).optional(),
    graduationYear: z.number().min(2020).max(2100).optional(),
    relationshipGoals: z.string().max(120).optional(),
    height: z.string().max(40).optional(),
    spotifyUrl: z.string().max(500).optional(),
    instagramUrl: z.string().max(500).optional(),
    fullName: z.string().min(2).max(80).optional(),
    gender: z.string().max(40).optional(),
    city: z.string().max(80).optional(),
    interests: z.array(z.string().min(1).max(40)).max(10).optional(),
    photos: z.array(z.string().min(1)).max(6).optional(),
    prompts: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1).max(200) })).max(3).optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

r.use(rateLimit(60, 60_000));
r.post("/register", validate(registerSchema), register);
r.post("/login", validate(loginSchema), login);
r.post("/google-login", googleLogin);
r.get("/profile", requireAuth, getProfile);
r.patch("/profile", requireAuth, validate(profileSchema), updateProfile);
r.get("/google", startGoogleOAuth);
r.get("/google/callback", handleGoogleCallback);

export default r;
