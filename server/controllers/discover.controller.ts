import { Request, Response } from "express";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Match } from "../models/Match";
import { AuthRequest } from "../middleware/auth.middleware";

const buildDiscoverCards = (users: any[], currentInterests: Set<string>, fallbackDistance: string) =>
  users.map((user: any) => ({
    ...user,
    mutualCount: (user.interests || []).filter((interest: string) => currentInterests.has(String(interest).toLowerCase())).length,
    online: Boolean(user.updatedAt && Date.now() - new Date(user.updatedAt).getTime() < 1000 * 60 * 60 * 36),
    distance: user.location?.zone || fallbackDistance,
    matchProbability: Math.min(
      98,
      45 +
        ((user.interests || []).filter((interest: string) => currentInterests.has(String(interest).toLowerCase())).length * 8) +
        (user.verificationStatus === "verified" ? 6 : 0) +
        (Array.isArray(user.photos) ? Math.min(user.photos.length, 3) * 5 : 0)
    )
  }));

export const discoverUsers = async (req: AuthRequest, res: Response) => {
  try {
    const university = req.query.university as string;
    const filter = (req.query.filter as string) || "All";
    if (!university) return res.status(400).json({ success: false, message: "university required" });

    const currentUser = req.userId ? await User.findById(req.userId).lean() : null;
    if (!currentUser) return res.status(401).json({ success: false, message: "Unauthorized" });

    const currentUserId = new mongoose.Types.ObjectId(req.userId!);

    const excludedIds: mongoose.Types.ObjectId[] = [
      currentUserId,
      ...(currentUser?.likedUsers || []).map((id: any) => new mongoose.Types.ObjectId(String(id))),
      ...(currentUser?.superLikedUsers || []).map((id: any) => new mongoose.Types.ObjectId(String(id))),
      ...(currentUser?.dislikedUsers || []).map((id: any) => new mongoose.Types.ObjectId(String(id))),
      ...(currentUser?.blockedUsers || []).map((id: any) => new mongoose.Types.ObjectId(String(id))),
    ];

    const existingMatches = await Match.find({ users: currentUserId }).lean();
    existingMatches.forEach((match: any) => {
      for (const id of match.users || []) {
        try { excludedIds.push(new mongoose.Types.ObjectId(String(id))); } catch { /* skip invalid */ }
      }
    });

    const base: any = {
      isBanned: false,
      _id: { $nin: excludedIds }
    };

    // Support both campusId (new) and university string (legacy)
    const campusFilter: any = { ...base };
    if ((currentUser as any).campusId) {
      campusFilter.campusId = (currentUser as any).campusId;
    } else if (university) {
      campusFilter.university = university;
    } else {
      return res.status(400).json({ success: false, message: "university required" });
    }

    const candidateFilter: any = { ...campusFilter };

    switch (filter) {
      case "Nearby":
        if (currentUser.location?.zone) candidateFilter["location.zone"] = currentUser.location.zone;
        break;
      case "Verified":
        candidateFilter.verificationStatus = "verified";
        break;
      case "Events":
        candidateFilter.interests = { $in: ["Events", "Concerts", "Festivals", "Photography", "Travel", "Dancing", "Music"] };
        break;
      default:
        break;
    }

    let query = User.find(candidateFilter).select("-passwordHash -studentIdUrl");

    switch (filter) {
      case "New":
        query = query.sort({ createdAt: -1 }).limit(40);
        break;
      case "Nearby":
      case "Verified":
      case "Events":
        query = query.limit(40);
        break;
      case "Trending":
        query = User.find({ ...base, university }).select("-passwordHash -studentIdUrl").sort({ profileViews: -1, updatedAt: -1 }).limit(40);
        break;
      default:
        query = query.limit(50);
    }

    const data = await query.lean();
    const currentInterests = new Set((currentUser?.interests || []).map((interest: string) => interest.toLowerCase()));

    let enriched = buildDiscoverCards(data, currentInterests, "Campus hotspot");

    if (!enriched.length) {
      const fallbackFilter: any = {
        isBanned: false,
        _id: { $nin: excludedIds }
      };
      if ((currentUser as any).campusId) {
        fallbackFilter.campusId = (currentUser as any).campusId;
      } else {
        fallbackFilter.university = university;
        fallbackFilter.verificationStatus = "verified";
      }

      const relaxedFallback = await User.find(fallbackFilter)
        .select("-passwordHash -studentIdUrl")
        .sort({ profileViews: -1, updatedAt: -1, createdAt: -1 })
        .limit(50)
        .lean();

      enriched = buildDiscoverCards(relaxedFallback, currentInterests, "Nearby campus").map((user: any) => ({
        ...user,
        matchProbability: Math.max(user.matchProbability || 0, Math.min(95, 40 + ((user.interests || []).length || 0) * 3))
      }));
    }

    res.json({ success: true, message: "Discover", data: enriched });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

export const swipeUser = async (req: AuthRequest, res: Response) => {
  try {
    const fromUserId = req.userId;
    const { toUserId, action } = req.body as { toUserId: string; action: "like" | "dislike" | "superlike" | "rose" | "compliment" };
    if (!fromUserId || !toUserId || !action) return res.status(400).json({ success: false, message: "toUserId and action required" });

    // Reject non-ObjectId IDs early (e.g. demo profiles) with a clear 400
    if (!/^[a-f\d]{24}$/i.test(toUserId)) {
      return res.status(400).json({ success: false, message: "Invalid user id" });
    }

    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId).select("fullName photos likedUsers superLikedUsers university");
    if (!fromUser || !toUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // rose and compliment count as a like for matching
    const effectiveAction = action === "rose" || action === "compliment" ? "like" : action;

    await User.updateOne({ _id: fromUserId }, {
      $pull: { likedUsers: toUser._id, superLikedUsers: toUser._id, dislikedUsers: toUser._id }
    });

    if (effectiveAction === "like") fromUser.likedUsers.push(toUser._id as any);
    else if (effectiveAction === "superlike") fromUser.superLikedUsers.push(toUser._id as any);
    else if (effectiveAction === "dislike") fromUser.dislikedUsers.push(toUser._id as any);
    await fromUser.save();

    const theyLikedBack =
      effectiveAction !== "dislike" && (
        toUser.likedUsers?.some((id: any) => String(id) === fromUserId) ||
        toUser.superLikedUsers?.some((id: any) => String(id) === fromUserId)
      );

    if (theyLikedBack) {
      let match = await Match.findOne({ users: { $all: [fromUserId, toUserId] } });
      if (!match) {
        match = await Match.create({ users: [fromUserId, toUserId], university: fromUser?.university });
      }
      return res.json({
        success: true,
        message: "Matched!",
        data: {
          matched: true,
          matchId: String(match._id),
          matchedUser: {
            id: toUserId,
            name: (toUser as any).fullName || "",
            photo: ((toUser as any).photos || [])[0] || "",
          },
          currentUser: {
            id: fromUserId,
            name: (fromUser as any).fullName || "",
            photo: ((fromUser as any).photos || [])[0] || "",
          },
        },
      });
    }

    res.json({ success: true, message: `${action} saved`, data: { matched: false } });
  } catch (e: any) {
    res.status(500).json({ success: false, message: e.message });
  }
};

