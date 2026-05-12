import { Router } from "express";

import adminMiddleware from "../../middlewares/admin.middleware.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validateMiddleware from "../../middlewares/validate.middleware.js";
import testimonialController from "./testimonial.controller.js";
import testimonialValidation from "./testimonial.validation.js";

const router = Router();

router.get(
  "/public",
  validateMiddleware(testimonialValidation.getPublicTestimonials),
  testimonialController.getPublicTestimonials
);

router.use(authMiddleware);

router.post(
  "/",
  validateMiddleware(testimonialValidation.createTestimonial),
  testimonialController.createTestimonial
);

router.get(
  "/admin",
  adminMiddleware,
  validateMiddleware(testimonialValidation.getAllTestimonials),
  testimonialController.getAllTestimonials
);

router.patch(
  "/:id/status",
  adminMiddleware,
  validateMiddleware(testimonialValidation.testimonialId),
  validateMiddleware(testimonialValidation.updateTestimonialStatus),
  testimonialController.updateTestimonialStatus
);

export default router;
