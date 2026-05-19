import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { findOrCreateCampus, joinCampus, nearbyCampuses, searchCampus, getCampusById } from "../controllers/campus.controller";

const r = Router();

r.get("/search",          searchCampus);
r.get("/nearby",          nearbyCampuses);
r.get("/:id",             getCampusById);
r.post("/find-or-create", requireAuth, findOrCreateCampus);
r.post("/join",           requireAuth, joinCampus);

export default r;
