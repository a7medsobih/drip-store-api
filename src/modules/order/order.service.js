// src/modules/order/order.service.js
import mongoose from "mongoose";

import { ORDER_STATUS } from "../../constants/orderStatus.js";
import Address from "../../models/Address.model.js";
import Cart from "../../models/Cart.model.js";
import Order from "../../models/Order.model.js";
import Product from "../../models/Product.model.js";
import AppError from "../../utils/AppError.js";

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

const buildOrdersResponse = (orders, page, limit, total) => ({
  items: orders,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1
  }
});

const getCartItemsForCheckout = async (userId, session) => {
  const cartItems = await Cart.find({ userId }).session(session);

  if (cartItems.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  return cartItems;
};

const getShippingAddressSnapshot = async (userId, addressId, session) => {
  const address = await Address.findOne({ _id: addressId, userId })
    .session(session)
    .lean();

  if (!address) {
    throw new AppError("Address not found", 404);
  }

  return {
    label: address.label,
    addressText: address.addressText
  };
};

const getAvailableProductsMap = async (productIds, session) => {
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
    isDeleted: false
  })
    .session(session)
    .lean();

  return new Map(products.map((product) => [product._id.toString(), product]));
};

const buildOrderItemsFromCart = (cartItems, productMap) => {
  const orderItems = [];

  for (const cartItem of cartItems) {
    const product = productMap.get(cartItem.productId.toString());

    if (!product) {
      throw new AppError("One or more products are no longer available", 400);
    }

    if (product.stock < cartItem.quantity) {
      throw new AppError(`Insufficient stock for product ${product.name}`, 400);
    }

    orderItems.push({
      productId: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: cartItem.quantity,
      totalPrice: product.price * cartItem.quantity
    });
  }

  return orderItems;
};

const decrementStockForOrderItems = async (orderItems, session) => {
  for (const item of orderItems) {
    const updateResult = await Product.updateOne(
      {
        _id: item.productId,
        isActive: true,
        isDeleted: false,
        stock: { $gte: item.quantity }
      },
      {
        $inc: { stock: -item.quantity }
      },
      {
        session
      }
    );

    if (updateResult.modifiedCount !== 1) {
      throw new AppError(`Insufficient stock for product ${item.name}`, 400);
    }
  }
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

const calculateOrderTotal = (orderItems) =>
  orderItems.reduce((total, item) => total + item.totalPrice, 0);

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

const ensureOrderCanBeCancelled = (order) => {
  if (order.status !== ORDER_STATUS.PENDING) {
    throw new AppError("Only pending orders can be cancelled", 400);
  }
};

const ensureOrderAccess = (order, user) => {
  const isOwner = order.userId.toString() === user.id;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new AppError("You are not allowed to access this order", 403);
  }
};

const getOrderItemsSnapshot = (order) => order.items ?? order.products ?? [];

const cancelOrderWithSession = async (orderId, user, session) => {
  const order = await getOrderById(orderId, session);

  ensureOrderAccess(order, user);
  ensureOrderCanBeCancelled(order);

  await restoreStockForOrderItems(getOrderItemsSnapshot(order), session);

  order.status = ORDER_STATUS.CANCELLED;
  await order.save({ session });

  return order;
};

const orderService = {
  async createOrder(userId, payload) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const cartItems = await getCartItemsForCheckout(userId, session);
      const shippingAddress = await getShippingAddressSnapshot(
        userId,
        payload.addressId,
        session
      );
      const productIds = cartItems.map((item) => item.productId);
      const productMap = await getAvailableProductsMap(productIds, session);
      const items = buildOrderItemsFromCart(cartItems, productMap);

      await decrementStockForOrderItems(items, session);

      const totalPrice = calculateOrderTotal(items);
      const [order] = await Order.create(
        [
          {
            userId,
            items,
            totalPrice,
            shippingAddress,
            status: ORDER_STATUS.PENDING
          }
        ],
        { session }
      );

      await Cart.deleteMany({ userId }, { session });

      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  },

  async getUserOrders(userId, queryParams) {
    const { page, limit, skip } = calculatePagination(queryParams);
    const query = { userId };

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(query)
    ]);

    return buildOrdersResponse(orders, page, limit, total);
  },

  async cancelOrder(orderId, user) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const order = await cancelOrderWithSession(orderId, user, session);

      await session.commitTransaction();

      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  },

  async getAllOrders(queryParams) {
    const { page, limit, skip } = calculatePagination(queryParams);
    const query = {};

    if (queryParams.status) {
      query.status = queryParams.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "name email mobile role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query)
    ]);

    return buildOrdersResponse(orders, page, limit, total);
  },

  async updateOrderStatus(orderId, status) {
    if (status === ORDER_STATUS.CANCELLED) {
      return this.cancelOrder(orderId, {
        id: "__admin__",
        role: "admin"
      });
    }

    const order = await getOrderById(orderId);

    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new AppError("Cancelled orders cannot be updated", 400);
    }

    order.status = status;
    await order.save();

    return order;
  }
};

export default orderService;
