// src/modules/refund/refund.service.js
import mongoose from "mongoose";

import { ORDER_STATUS } from "../../constants/orderStatus.js";
import Order from "../../models/Order.model.js";
import Product from "../../models/Product.model.js";
import Refund from "../../models/Refund.model.js";
import AppError from "../../utils/AppError.js";

const REFUND_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REFUSED: "refused"
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const calculatePagination = (queryParams) => {
  const page = Number(queryParams.page) || DEFAULT_PAGE;
  const limit = Number(queryParams.limit) || DEFAULT_LIMIT;

  return {
    page,
    limit,
    skip: (page - 1) * limit
  };
};

const buildRefundsResponse = (refunds, page, limit, total) => ({
  items: refunds,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1
  }
});

const getOrderById = async (orderId, session) => {
  const query = Order.findById(orderId);

  if (session) {
    query.session(session);
  }

  const order = await query;

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};

const getRefundById = async (refundId, session) => {
  const query = Refund.findById(refundId);

  if (session) {
    query.session(session);
  }

  const refund = await query;

  if (!refund) {
    throw new AppError("Refund request not found", 404);
  }

  return refund;
};

const restoreStockForOrderItems = async (orderItems, session) => {
  for (const item of orderItems) {
    await Product.updateOne(
      {
        _id: item.productId
      },
      {
        $inc: { stock: item.quantity }
      },
      {
        session
      }
    );
  }
};

const refundService = {
  async createRefund(userId, payload) {
    const order = await getOrderById(payload.orderId);

    if (order.userId.toString() !== userId) {
      throw new AppError("You are not allowed to refund this order", 403);
    }

    if (order.status !== ORDER_STATUS.DELIVERED) {
      throw new AppError("Refund is allowed only for delivered orders", 400);
    }

    const existingRefund = await Refund.findOne({ orderId: payload.orderId });
    if (existingRefund) {
      throw new AppError("Refund request already exists for this order", 400);
    }

    const refund = await Refund.create({
      userId,
      orderId: payload.orderId,
      reason: payload.reason.trim(),
      status: REFUND_STATUS.PENDING
    });

    return refund;
  },

  async getAllRefunds(queryParams) {
    const { page, limit, skip } = calculatePagination(queryParams);
    const query = {};

    if (queryParams.status) {
      query.status = queryParams.status;
    }

    const [refunds, total] = await Promise.all([
      Refund.find(query)
        .populate("userId", "name email mobile role")
        .populate("orderId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Refund.countDocuments(query)
    ]);

    return buildRefundsResponse(refunds, page, limit, total);
  },

  async updateRefundStatus(refundId, status) {
    if (status === REFUND_STATUS.APPROVED) {
      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        const refund = await getRefundById(refundId, session);

        if (refund.status !== REFUND_STATUS.PENDING) {
          throw new AppError("Only pending refund requests can be approved", 400);
        }

        const order = await getOrderById(refund.orderId, session);
        const orderItems = order.items ?? [];

        await restoreStockForOrderItems(orderItems, session);

        refund.status = REFUND_STATUS.APPROVED;
        order.status = ORDER_STATUS.REFUNDED;

        await Promise.all([refund.save({ session }), order.save({ session })]);

        await session.commitTransaction();

        return refund;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        await session.endSession();
      }
    }

    const refund = await getRefundById(refundId);
    refund.status = status;
    await refund.save();

    return refund;
  }
};

export default refundService;
