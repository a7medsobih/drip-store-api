// models/Address.model.js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    label: {
      type: String,
      enum: ["home", "work", "other"],
      required: true
    },
    addressText: {
      type: String,
      required: true,
      minlength: 10,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Address = mongoose.model("Address", addressSchema);

export default Address;
