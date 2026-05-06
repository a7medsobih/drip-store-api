import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500,
      trim: true
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    isApproved: {
      type: Boolean,
      default: false
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

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
