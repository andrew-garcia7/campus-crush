import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User";

export interface AuthRequest extends Request {
	userId?: string;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
	const authorization = req.headers.authorization;
	if (!authorization?.startsWith("Bearer ")) {
		return res.status(401).json({ success: false, message: "Unauthorized" });
	}

	const token = authorization.slice(7).trim();
	if (!token || !env.JWT_SECRET) {
		return res.status(401).json({ success: false, message: "Unauthorized" });
	}

	try {
		const payload = jwt.verify(token, env.JWT_SECRET) as { userId?: string };
		if (!payload.userId) {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

		req.userId = payload.userId;
		return next();
	} catch {
		return res.status(401).json({ success: false, message: "Unauthorized" });
	}
};

// Sets req.userId if a valid Bearer token is present, but never blocks the request.
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
	const authorization = req.headers.authorization;
	if (authorization?.startsWith("Bearer ") && env.JWT_SECRET) {
		const token = authorization.slice(7).trim();
		try {
			const payload = jwt.verify(token, env.JWT_SECRET) as { userId?: string };
			if (payload.userId) req.userId = payload.userId;
		} catch { /* invalid token — just ignore */ }
	}
	return next();
};

export const requireVerified = async (req: AuthRequest, res: Response, next: NextFunction) => {
	if (!req.userId) {
		return res.status(401).json({ success: false, message: "Unauthorized" });
	}
	try {
		const user = await User.findById(req.userId).select("verificationStatus isBanned").lean();
		if (!user) {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}
		if ((user as any).isBanned) {
			return res.status(403).json({ success: false, message: "Your account has been banned." });
		}
		if ((user as any).verificationStatus !== "verified") {
			return res.status(403).json({
				success: false,
				message: "Complete verification to access this feature.",
				redirect: "/verification",
			});
		}
		return next();
	} catch {
		return res.status(500).json({ success: false, message: "Server error" });
	}
};
