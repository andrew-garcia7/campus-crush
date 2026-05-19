import mongoose, {
  Schema
} from "mongoose";

const verificationSchema =
  new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      studentIdUrl: {
        type: String,
        required: true
      },

      selfieUrl: {
        type: String,
        required: true
      },

      collegeName: String,

      extractedText: String,

      faceMatchScore: Number,

      status: {
        type: String,
        enum: [
          "pending",
          "verified",
          "rejected"
        ],
        default: "pending"
      }
    },
    {
      timestamps: true
    }
  );

export const Verification =
  mongoose.model(
    "Verification",
    verificationSchema
  );