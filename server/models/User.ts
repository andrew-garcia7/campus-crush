import mongoose, { Schema } from "mongoose";

const schema = new Schema(
	{
		fullName: String,
		email: { type: String, unique: true },
		passwordHash: String,
		age: Number,
		university: String,                     // human-readable campus name
		campusId: { type: Schema.Types.ObjectId, ref: "Campus" }, // linked campus doc
		department: String,
		graduationYear: Number,
		relationshipGoals: String,
		gender: String,
		city: String,
		height: String,
		spotifyUrl: String,
		instagramUrl: String,
		role: { type: String, enum: ["student", "coach", "admin"], default: "student" },
		verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
		bio: String,
		interests: [String],
		photos: [String],
		prompts: [
			{
				question: String,
				answer: String
			}
		],
		likedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
		superLikedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
		dislikedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
		blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
		profileViews: { type: Number, default: 0 },
		// Legacy zone string + new GeoJSON point for geo queries
		location: {
			lat:  Number,
			lng:  Number,
			zone: String,
			// GeoJSON sub-document (kept flat for $geoNear / $near queries)
			// No default on `type` — a partial GeoJSON object without coordinates
			// causes a MongoServerError on the 2dsphere index.
			geoPoint: {
				type:        { type: String, enum: ["Point"] },
				coordinates: [Number]   // [lng, lat]
			}
		},
		isBanned: { type: Boolean, default: false },
		studentIdUrl: String,
		selfieUrl: String,
		rejectionReason: String
	},
	{ timestamps: true }
);

// 2dsphere index on the embedded GeoJSON point.
// sparse: true → skips documents where geoPoint is absent (e.g. new Google signups)
schema.index({ "location.geoPoint": "2dsphere" }, { sparse: true });

export const User = mongoose.model("User", schema);
