import { Request, Response } from "express";
import { Campus } from "../models/Campus";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth.middleware";

const NEARBY_RADIUS_M = 500; // metres — consider same campus within 500m

// POST /api/v1/campus/find-or-create
// Body: { name, lat, lng, city }
export const findOrCreateCampus = async (req: AuthRequest, res: Response) => {
  try {
    const { name, lat, lng, city = "" } = req.body as { name: string; lat: number; lng: number; city?: string };
    if (!name || lat == null || lng == null) {
      return res.status(400).json({ success: false, message: "name, lat and lng are required" });
    }

    // 1. Try to find an existing campus within NEARBY_RADIUS_M metres
    const existing = await Campus.findOne({
      location: {
        $near: {
          $geometry:    { type: "Point", coordinates: [lng, lat] },
          $maxDistance: NEARBY_RADIUS_M
        }
      }
    });

    if (existing) {
      // Increment member count
      await Campus.updateOne({ _id: existing._id }, { $inc: { memberCount: 1 } });
      return res.json({ success: true, message: "Campus found", data: existing, created: false });
    }

    // 2. Also check by name (fuzzy — case insensitive)
    const byName = await Campus.findOne({ name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } });
    if (byName) {
      await Campus.updateOne({ _id: byName._id }, { $inc: { memberCount: 1 } });
      return res.json({ success: true, message: "Campus found", data: byName, created: false });
    }

    // 3. Create new campus
    const campus = await Campus.create({
      name: name.trim(),
      city:     city.trim(),
      location: { type: "Point", coordinates: [lng, lat] },
      createdBy: req.userId
    });

    return res.status(201).json({ success: true, message: "Campus created", data: campus, created: true });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/v1/campus/join  — attach user to a campus
// Body: { campusId, lat, lng }
export const joinCampus = async (req: AuthRequest, res: Response) => {
  try {
    const { campusId, lat, lng } = req.body as { campusId: string; lat: number; lng: number };
    if (!campusId || lat == null || lng == null) {
      return res.status(400).json({ success: false, message: "campusId, lat and lng are required" });
    }

    const campus = await Campus.findById(campusId);
    if (!campus) return res.status(404).json({ success: false, message: "Campus not found" });

    await User.updateOne({ _id: req.userId }, {
      $set: {
        campusId:   campus._id,
        university: campus.name,
        "location.lat":  lat,
        "location.lng":  lng,
        "location.geoPoint": { type: "Point", coordinates: [lng, lat] }
      }
    });

    return res.json({ success: true, message: "Joined campus", data: { campusId: campus._id, campusName: campus.name } });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/v1/campus/search?q=...
export const searchCampus = async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ success: true, data: [] });

    const results = await Campus.find({
      $text: { $search: q }
    }).limit(10).lean();

    // Also do regex search as fallback
    if (results.length === 0) {
      const regex = await Campus.find({ name: { $regex: q, $options: "i" } }).limit(10).lean();
      return res.json({ success: true, data: regex });
    }

    return res.json({ success: true, data: results });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/v1/campus/nearby?lat=&lng=&radius=
export const nearbyCampuses = async (req: Request, res: Response) => {
  try {
    const lat    = parseFloat(req.query.lat as string);
    const lng    = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string) || 5000; // metres

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: "lat and lng required" });
    }

    const campuses = await Campus.find({
      location: {
        $near: {
          $geometry:    { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radius
        }
      }
    }).limit(10).lean();

    return res.json({ success: true, data: campuses });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/v1/campus/:id
export const getCampusById = async (req: Request, res: Response) => {
  try {
    const campus = await Campus.findById(req.params.id).lean();
    if (!campus) return res.status(404).json({ success: false, message: "Campus not found" });
    return res.json({ success: true, data: campus });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
