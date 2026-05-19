import { Router } from "express";
import { listEvents, getEvent, createEvent, rsvpEvent } from "../controllers/events.controller";
import { requireAuth } from "../middleware/auth.middleware";

const r = Router();

r.get("/", listEvents);
r.get("/:id", getEvent);
r.post("/", requireAuth, createEvent);
r.post("/:id/rsvp", requireAuth, rsvpEvent);

export default r;
