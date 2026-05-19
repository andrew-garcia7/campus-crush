import { Request, Response } from "express";
import {
  loginUser,
  registerUser,
  toSafeUser
} from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { User } from "../models/User";
import { signJwt } from "../utils/jwt";

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      fullName,
      email,
      password,
      university
    } = req.body;

    const data = await registerUser({
      fullName,
      email,
      password,
      university
    });

    res.status(201).json({
      success: true,
      message: "Registered",
      data
    });
  } catch (error: any) {
    console.error("Register error:", error);

    res.status(400).json({
      success: false,
      message:
        error.message || "Registration failed"
    });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const data = await loginUser(
      String(email || ""),
      String(password || "")
    );

    res.json({
      success: true,
      message: "Logged in",
      data
    });
  } catch (error: any) {
    console.error("Login error:", error);

    res.status(401).json({
      success: false,
      message:
        error.message || "Login failed"
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const likesCount = await User.countDocuments({
      $or: [{ likedUsers: req.userId }, { superLikedUsers: req.userId }]
    });

    res.json({
      success: true,
      message: "Profile",
      data: { user: { ...toSafeUser(user), likesCount } }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Unable to load profile" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const update = req.body || {};
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const allowedPhotos = Array.isArray(update.photos) ? update.photos.filter(Boolean).slice(0, 6) : user.photos;
    if (typeof update.fullName === "string" && update.fullName.trim()) user.fullName = update.fullName.trim();
    user.bio = typeof update.bio === "string" ? update.bio.trim() : user.bio;
    user.age = typeof update.age === "number" ? update.age : user.age;
    user.gender = typeof update.gender === "string" ? update.gender.trim() : user.gender;
    user.city = typeof update.city === "string" ? update.city.trim() : user.city;
    user.university = typeof update.university === "string" ? update.university.trim() : user.university;
    user.department = typeof update.department === "string" ? update.department.trim() : user.department;
    user.graduationYear = typeof update.graduationYear === "number" ? update.graduationYear : user.graduationYear;
    user.relationshipGoals = typeof update.relationshipGoals === "string" ? update.relationshipGoals.trim() : user.relationshipGoals;
    user.height = typeof update.height === "string" ? update.height.trim() : user.height;
    user.spotifyUrl = typeof update.spotifyUrl === "string" ? update.spotifyUrl.trim() : user.spotifyUrl;
    user.instagramUrl = typeof update.instagramUrl === "string" ? update.instagramUrl.trim() : user.instagramUrl;
    user.interests = Array.isArray(update.interests) ? update.interests.filter(Boolean).slice(0, 10) : user.interests;
    user.prompts = Array.isArray(update.prompts)
      ? update.prompts
          .filter((prompt: any) => prompt?.question && prompt?.answer)
          .slice(0, 3)
          .map((prompt: any) => ({ question: String(prompt.question), answer: String(prompt.answer) }))
      : user.prompts;
    user.photos = allowedPhotos;

    await user.save();

    const likesCount = await User.countDocuments({
      $or: [{ likedUsers: req.userId }, { superLikedUsers: req.userId }]
    });

    res.json({
      success: true,
      message: "Profile updated",
      data: { user: { ...toSafeUser(user), likesCount } }
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Profile update failed" });
  }
};

// ---------------------------------------------------------------------------
// POST /auth/google-login
// Accepts a Firebase ID token, verifies it against Google's tokeninfo API,
// then finds-or-creates the MongoDB user and returns our own JWT.
// ---------------------------------------------------------------------------
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== "string") {
      return res.status(400).json({ success: false, message: "idToken is required" });
    }

    // Verify the Firebase ID token via Google's public tokeninfo endpoint
    // (no Firebase Admin SDK needed — works with any Firebase project)
    const tokenInfoResp = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );
    const tokenInfo = (await tokenInfoResp.json()) as any;

    if (!tokenInfoResp.ok || tokenInfo.error || !tokenInfo.email) {
      return res.status(401).json({ success: false, message: "Invalid or expired Google token" });
    }

    const email      = (tokenInfo.email as string).toLowerCase().trim();
    const displayName: string = tokenInfo.name || tokenInfo.email;
    const photoURL: string | null = tokenInfo.picture || null;

    let user = await User.findOne({ email });

    if (!user) {
      // New user — create with Google profile data
      user = await User.create({
        fullName: displayName,
        email,
        photos: photoURL ? [photoURL] : []
        // verificationStatus defaults to "pending" per schema
      });
    } else {
      // Existing user — backfill missing photo if not set
      let changed = false;
      if ((!user.photos || user.photos.length === 0) && photoURL) {
        user.photos = [photoURL];
        changed = true;
      }
      if (changed) await user.save();
    }

    const token = signJwt(String(user._id));

    return res.json({
      success: true,
      message: "Google login successful",
      data: { token, user: toSafeUser(user) }
    });
  } catch (error: any) {
    console.error("Google login error:", error);
    return res.status(500).json({ success: false, message: error.message || "Google login failed" });
  }
};