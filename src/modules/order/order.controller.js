import ApiResponse from "../../utils/ApiResponse.js";
import orderService from "./order.service.js";

const orderController = {
  async createOrder(req, res, next) {
    try {
      const order = await orderService.createOrder(req.user.id, req.body);

      res
        .status(201)
        .json(new ApiResponse(201, "Order created successfully", order, null));
    } catch (error) {
      next(error);
    }
  },

  async getUserOrders(req, res, next) {
    try {
      const orders = await orderService.getUserOrders(req.user.id, req.query);

      res
        .status(200)
        .json(new ApiResponse(200, "Orders fetched successfully", orders, null));
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req, res, next) {
    try {
      const order = await orderService.cancelOrder(req.params.id, req.user);

      res
        .status(200)
        .json(new ApiResponse(200, "Order cancelled successfully", order, null));
    } catch (error) {
      next(error);
    }
  },

  async getAllOrders(req, res, next) {
    try {
      const orders = await orderService.getAllOrders(req.query);

      res
        .status(200)
        .json(new ApiResponse(200, "All orders fetched successfully", orders, null));
    } catch (error) {
      next(error);
    }
  },

  async updateOrderStatus(req, res, next) {
    try {
      const order = await orderService.updateOrderStatus(
        req.params.id,
        req.body.status
      );

      res
        .status(200)
        .json(new ApiResponse(200, "Order status updated successfully", order, null));
    } catch (error) {
      next(error);
    }
  }
};

export default orderController;
