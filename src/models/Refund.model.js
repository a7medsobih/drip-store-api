import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reason: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 500,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "refused"],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

const Refund = mongoose.model("Refund", refundSchema);

export default Refund;
