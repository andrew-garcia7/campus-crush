import { Router } from "express"; import { adminSummary } from "../controllers/admin.controller"; const r=Router(); r.get("/summary",adminSummary); export default r;
