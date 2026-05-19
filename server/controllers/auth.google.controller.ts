import { Request, Response } from "express";
import crypto from "crypto";
import { signJwt } from "../utils/jwt";
import { User } from "../models/User";
import { env } from "../config/env";

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export const startGoogleOAuth = (_req: Request, res: Response) => {
  const state = crypto.randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALLBACK_URL,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent"
  });

  res.redirect(`${GOOGLE_OAUTH_URL}?${params.toString()}`);
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  if (!code) return res.status(400).json({ success: false, message: "Missing Google code" });

  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      grant_type: "authorization_code"
    })
  });
  const tokenJson = await tokenResp.json() as { access_token?: string };
  if (!tokenJson.access_token) return res.status(400).json({ success: false, message: "Google token exchange failed" });

  const profileResp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenJson.access_token}` }
  });
  const profile = await profileResp.json() as { email?: string; name?: string };

  if (!profile.email) return res.status(400).json({ success: false, message: "Google profile missing email" });

  const email = profile.email.toLowerCase();
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      fullName: profile.name || "Google User",
      email,
      university: email.split("@")[1]?.split(".")[0]?.toUpperCase() || "UNKNOWN"
    });
  }

  const token = signJwt(user.id);
  const redirectUrl = `${env.CLIENT_URL}/login?token=${encodeURIComponent(token)}`;
  res.redirect(redirectUrl);
};
