import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Confession } from "../models/Confession";

export const listConfessions = async (req: AuthRequest, res: Response) => {
	try {
		const university = String(req.query.university || "");
		const category = String(req.query.category || "");
		const filter: Record<string, unknown> = {};
		if (university) filter.university = university;
		if (category && category !== "all") filter.category = category;

		const docs = await Confession.find(filter).sort({ createdAt: -1 }).limit(100).lean();
		const userId = req.userId ? String(req.userId) : "";

		res.json({
			success: true,
			message: "Confessions",
			data: docs.map((doc: any) => ({
				...doc,
				liked: userId ? (doc.likedBy || []).some((value: any) => String(value) === userId) : false,
				isOwner: userId ? String(doc.author) === userId : false,
				likes: doc.likesCount,
				shares: doc.sharesCount,
				reports: doc.reportsCount,
				commentsCount: Array.isArray(doc.comments) ? doc.comments.length : 0,
				reactions: (doc.reactions || []).map((r: any) => ({
					emoji: r.emoji,
					count: r.count,
					reacted: userId ? (r.reactedBy || []).some((id: any) => String(id) === userId) : false
				}))
			}))
		});
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message || "Unable to load confessions" });
	}
};

export const createConfession = async (req: AuthRequest, res: Response) => {
	try {
		const data = await Confession.create({
			university: req.body.university,
			text: String(req.body.text || "").trim(),
			category: req.body.category || "confession",
			author: req.userId
		});
		res.status(201).json({ success: true, message: "Posted", data });
	} catch (error: any) {
		res.status(400).json({ success: false, message: error.message || "Unable to post confession" });
	}
};

export const toggleConfessionLike = async (req: AuthRequest, res: Response) => {
	try {
		const confession = await Confession.findById(req.params.id);
		if (!confession) return res.status(404).json({ success: false, message: "Confession not found" });

		const userId = req.userId!;
		const existing = confession.likedBy.findIndex((value: any) => String(value) === userId);
		if (existing >= 0) confession.likedBy.splice(existing, 1);
		else confession.likedBy.push(userId as any);
		confession.likesCount = confession.likedBy.length;
		await confession.save();

		res.json({ success: true, message: existing >= 0 ? "Like removed" : "Liked", data: { likes: confession.likesCount, liked: existing < 0 } });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message || "Unable to like confession" });
	}
};

export const commentOnConfession = async (req: AuthRequest, res: Response) => {
	try {
		const confession = await Confession.findById(req.params.id);
		if (!confession) return res.status(404).json({ success: false, message: "Confession not found" });

		confession.comments.push({ text: String(req.body.text || "").trim(), createdAt: new Date() } as any);
		await confession.save();

		res.status(201).json({ success: true, message: "Comment added", data: { commentsCount: confession.comments.length, comments: confession.comments } });
	} catch (error: any) {
		res.status(400).json({ success: false, message: error.message || "Unable to comment" });
	}
};

export const shareConfession = async (req: Request, res: Response) => {
	try {
		const confession = await Confession.findByIdAndUpdate(req.params.id, { $inc: { sharesCount: 1 } }, { new: true });
		if (!confession) return res.status(404).json({ success: false, message: "Confession not found" });
		res.json({ success: true, message: "Shared", data: { shares: confession.sharesCount } });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message || "Unable to share confession" });
	}
};

export const deleteConfession = async (req: AuthRequest, res: Response) => {
	try {
		const confession = await Confession.findById(req.params.id);
		if (!confession) return res.status(404).json({ success: false, message: "Confession not found" });
		if (String(confession.author) !== String(req.userId))
			return res.status(403).json({ success: false, message: "Not your confession" });
		await confession.deleteOne();
		res.json({ success: true, message: "Deleted" });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message || "Unable to delete" });
	}
};

export const reactToConfession = async (req: AuthRequest, res: Response) => {
	try {
		const { emoji } = req.body;
		if (!emoji) return res.status(400).json({ success: false, message: "Emoji required" });

		const confession = await Confession.findById(req.params.id);
		if (!confession) return res.status(404).json({ success: false, message: "Confession not found" });

		const userId = req.userId!;
		const reactions = confession.reactions as any[];
		let bucket = reactions.find((r: any) => r.emoji === emoji);

		if (!bucket) {
			reactions.push({ emoji, count: 1, reactedBy: [userId] });
		} else {
			const idx = (bucket.reactedBy as any[]).findIndex((id: any) => String(id) === String(userId));
			if (idx >= 0) {
				bucket.reactedBy.splice(idx, 1);
			} else {
				bucket.reactedBy.push(userId);
			}
			bucket.count = bucket.reactedBy.length;
		}

		confession.markModified("reactions");
		await confession.save();

		res.json({
			success: true,
			message: "Reacted",
			data: {
				reactions: (confession.reactions as any[]).map((r: any) => ({
					emoji: r.emoji,
					count: r.count,
					reacted: (r.reactedBy as any[]).some((id: any) => String(id) === String(userId))
				}))
			}
		});
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message || "Unable to react" });
	}
};

export const reportConfession = async (req: AuthRequest, res: Response) => {
	try {
		const confession = await Confession.findById(req.params.id);
		if (!confession) return res.status(404).json({ success: false, message: "Confession not found" });

		const userId = req.userId!;
		if (!confession.reportedBy.some((value: any) => String(value) === userId)) {
			confession.reportedBy.push(userId as any);
			confession.reportsCount = confession.reportedBy.length;
			await confession.save();
		}

		res.json({ success: true, message: "Reported", data: { reports: confession.reportsCount } });
	} catch (error: any) {
		res.status(500).json({ success: false, message: error.message || "Unable to report confession" });
	}
};
