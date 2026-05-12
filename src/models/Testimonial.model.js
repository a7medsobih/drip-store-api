import mongoose from "mongoose";

const testimonialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 500,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
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
