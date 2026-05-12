// src/modules/testimonial/testimonial.service.js
import Testimonial from "../../models/Testimonial.model.js";
import AppError from "../../utils/AppError.js";

const TESTIMONIAL_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REFUSED: "refused"
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const DEFAULT_PUBLIC_LIMIT = 10;

const calculatePagination = (queryParams) => {
    const page = Number(queryParams.page) || DEFAULT_PAGE;
    const limit = Number(queryParams.limit) || DEFAULT_LIMIT;

    return {
        page,
        limit,
        skip: (page - 1) * limit
    };
};

const buildTestimonialsResponse = (items, page, limit, total) => ({
    items,
    pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
    }
});

const getTestimonialById = async (testimonialId) => {
    const testimonial = await Testimonial.findById(testimonialId);

    if (!testimonial) {
        throw new AppError("Testimonial not found", 404);
    }

    return testimonial;
};

const testimonialService = {
    async createTestimonial(userId, payload) {
        const testimonial = await Testimonial.create({
            userId,
            message: payload.message.trim(),
            rating: payload.rating,
            status: TESTIMONIAL_STATUS.PENDING
        });

        return testimonial;
    },

    async getPublicTestimonials(queryParams) {
        const limit = Number(queryParams.limit) || DEFAULT_PUBLIC_LIMIT;

        const testimonials = await Testimonial.find({
            status: TESTIMONIAL_STATUS.APPROVED
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        return testimonials;
    },

    async getAllTestimonials(queryParams) {
        const { page, limit, skip } = calculatePagination(queryParams);
        const query = {};

        if (queryParams.status) {
            query.status = queryParams.status;
        }

        const [testimonials, total] = await Promise.all([
            Testimonial.find(query)
                .populate("userId", "name email mobile role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Testimonial.countDocuments(query)
        ]);

        return buildTestimonialsResponse(testimonials, page, limit, total);
    },

    async updateTestimonialStatus(testimonialId, status) {
        const testimonial = await getTestimonialById(testimonialId);

        if (testimonial.status !== TESTIMONIAL_STATUS.PENDING) {
            throw new AppError("Only pending testimonials can be updated", 400);
        }

        testimonial.status = status;
        await testimonial.save();

        return testimonial;
    }
};

export default testimonialService;
