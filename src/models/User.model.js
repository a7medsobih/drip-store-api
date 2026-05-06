// src/models/User.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 60,
      trim: true
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    emailConsent: {
      type: Boolean,
      default: false
    },
    // Auth security
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    // OTP system
    otpHash: {
      type: String
    },
    otpExpires: {
      type: Date
    },
    otpAttempts: {
      type: Number,
      default: 0
    },
    otpPurpose: {
      type: String,
      enum: ["verify-email", "reset-password"]
    },
    // Password reset control
    passwordResetAllowedUntil: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;
