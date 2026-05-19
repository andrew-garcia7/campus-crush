import mongoose, { Schema } from "mongoose";

const campusSchema = new Schema(
  {
    name:       { type: String, required: true, trim: true, index: true },
    city:       { type: String, trim: true, default: "" },
    country:    { type: String, trim: true, default: "India" },
    // GeoJSON point — enables 2dsphere geo queries
    location: {
      type:        { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }  // [lng, lat]
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    verified:  { type: Boolean, default: false },
    memberCount: { type: Number, default: 1 }
  },
  { timestamps: true }
);

campusSchema.index({ location: "2dsphere" });
campusSchema.index({ name: "text", city: "text" });

export const Campus = mongoose.models.Campus || mongoose.model("Campus", campusSchema);
