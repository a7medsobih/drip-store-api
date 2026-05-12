import ApiResponse from "../../utils/ApiResponse.js";
import refundService from "./refund.service.js";

const refundController = {
  async createRefund(req, res, next) {
    try {
      const refund = await refundService.createRefund(req.user.id, req.body);

      res
        .status(201)
        .json(new ApiResponse(201, "Refund request created successfully", refund));
    } catch (error) {
      next(error);
    }
  },

  async getAllRefunds(req, res, next) {
    try {
      const refunds = await refundService.getAllRefunds(req.query);

      res
        .status(200)
        .json(new ApiResponse(200, "Refund requests fetched successfully", refunds));
    } catch (error) {
      next(error);
    }
  },

  async updateRefundStatus(req, res, next) {
    try {
      const refund = await refundService.updateRefundStatus(
        req.params.id,
        req.body.status
      );

      res
        .status(200)
        .json(new ApiResponse(200, "Refund status updated successfully", refund));
    } catch (error) {
      next(error);
    }
  }
};

export default refundController;
