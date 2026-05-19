import { Router } from "express"; import { nearbyStudents } from "../controllers/map.controller"; const r=Router(); r.get("/nearby",nearbyStudents); export default r;
