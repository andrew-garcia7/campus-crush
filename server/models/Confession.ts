import mongoose, { Schema } from "mongoose";

const schema = new Schema(
	{
		university: { type: String, required: true, trim: true },
		text: { type: String, required: true, trim: true, maxlength: 400 },
		category: {
			type: String,
			enum: ["confession", "crush-story", "breakup", "funny", "library", "fest", "hostel"],
			default: "confession"
		},
		author: { type: Schema.Types.ObjectId, ref: "User" },
		likesCount: { type: Number, default: 0 },
		sharesCount: { type: Number, default: 0 },
		reportsCount: { type: Number, default: 0 },
		likedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
		reportedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
		reactions: [
			{
				emoji: { type: String, required: true },
				count: { type: Number, default: 0 },
				reactedBy: [{ type: Schema.Types.ObjectId, ref: "User" }]
			}
		],
		comments: [
			{
				text: { type: String, required: true, trim: true, maxlength: 240 },
				createdAt: { type: Date, default: Date.now }
			}
		]
	},
	{ timestamps: true }
);

export const Confession = mongoose.models.Confession || mongoose.model("Confession", schema);
