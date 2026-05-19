import { Request, Response } from "express";
import { User } from "../models/User";

// GET /api/v1/map/nearby?lat=&lng=&radius=&campusId=&university=
export const nearbyStudents = async (req: Request, res: Response) => {
  try {
    const university = req.query.university as string | undefined;
    const campusId   = req.query.campusId   as string | undefined;
    const lat        = parseFloat(req.query.lat    as string);
    const lng        = parseFloat(req.query.lng    as string);
    const radius     = parseInt(req.query.radius   as string) || 1000; // metres

    let users: any[] = [];

    // Priority 1: campusId — all members of the same campus
    if (campusId) {
      users = await User.find({ campusId, isBanned: false })
        .select("fullName photos location age")
        .limit(100)
        .lean();
    }

    // Priority 2: geo query when coordinates provided
    if (!users.length && !isNaN(lat) && !isNaN(lng)) {
      users = await User.find({
        isBanned: false,
        "location.geoPoint": {
          $near: {
            $geometry:    { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radius,
          },
        },
      })
        .select("fullName photos location age")
        .limit(50)
        .lean();
    }

    // Fallback: same university string
    if (!users.length && university) {
      users = await User.find({ university, isBanned: false })
        .select("fullName photos location age")
        .limit(50)
        .lean();
    }

    // Normalise: expose lat/lng at top level so the frontend can place markers
    const normalised = users.map((u: any) => {
      const coords = u.location?.geoPoint?.coordinates; // [lng, lat]
      return {
        _id:      u._id,
        fullName: u.fullName,
        photos:   u.photos,
        age:      u.age,
        location: u.location,
        lat: coords ? coords[1] : (u.location?.lat ?? null),
        lng: coords ? coords[0] : (u.location?.lng ?? null),
      };
    }).filter((u: any) => u.lat !== null && u.lng !== null);

    return res.json({ success: true, message: "Nearby", data: normalised });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};


