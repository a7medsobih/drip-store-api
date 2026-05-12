import ApiResponse from "../../utils/ApiResponse.js";
import testimonialService from "./testimonial.service.js";

const testimonialController = {
  async createTestimonial(req, res, next) {
    try {
      const testimonial = await testimonialService.createTestimonial(
        req.user.id,
        req.body
      );

      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            "Testimonial created successfully",
            testimonial,
            null
          )
        );
    } catch (error) {
      next(error);
    }
  },

  async getPublicTestimonials(req, res, next) {
    try {
      const testimonials = await testimonialService.getPublicTestimonials(req.query);

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Public testimonials fetched successfully",
            testimonials,
            null
          )
        );
    } catch (error) {
      next(error);
    }
  },

  async getAllTestimonials(req, res, next) {
    try {
      const testimonials = await testimonialService.getAllTestimonials(req.query);

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "All testimonials fetched successfully",
            testimonials,
            null
          )
        );
    } catch (error) {
      next(error);
    }
  },

  async updateTestimonialStatus(req, res, next) {
    try {
      const testimonial = await testimonialService.updateTestimonialStatus(
        req.params.id,
        req.body.status
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Testimonial status updated successfully",
            testimonial,
            null
          )
        );
    } catch (error) {
      next(error);
    }
  }
};

export default testimonialController;
