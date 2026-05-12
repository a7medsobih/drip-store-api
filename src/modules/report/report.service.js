//src/modules/report/report.service.js
import { ORDER_STATUS } from "../../constants/orderStatus.js";
import Order from "../../models/Order.model.js";
import AppError from "../../utils/AppError.js";

const EXCLUDED_STATUSES = [ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED];

const parseDateRange = (queryParams) => {
  const { from, to } = queryParams;
  const createdAt = {};

  if (from !== undefined) {
    const fromDate = new Date(from);
    if (Number.isNaN(fromDate.getTime())) {
      throw new AppError("Invalid from date", 400);
    }
    createdAt.$gte = fromDate;
  }

  if (to !== undefined) {
    const toDate = new Date(to);
    if (Number.isNaN(toDate.getTime())) {
      throw new AppError("Invalid to date", 400);
    }
    toDate.setHours(23, 59, 59, 999);
    createdAt.$lte = toDate;
  }

  if (createdAt.$gte && createdAt.$lte && createdAt.$gte > createdAt.$lte) {
    throw new AppError("Invalid date range", 400);
  }

  return createdAt;
};

const reportService = {
  async getAdminReports(queryParams) {
    const createdAt = parseDateRange(queryParams);
    const match = {
      status: { $nin: EXCLUDED_STATUSES }
    };

    if (Object.keys(createdAt).length > 0) {
      match.createdAt = createdAt;
    }

    const [summaryResult, topProducts] = await Promise.all([
      Order.aggregate([
        { $match: match },
        {
          $project: {
            totalPrice: 1,
            unitsSold: {
              $sum: {
                $map: {
                  input: "$items",
                  as: "item",
                  in: "$$item.quantity"
                }
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
            totalOrders: { $sum: 1 },
            unitsSold: { $sum: "$unitsSold" }
          }
        }
      ]),
      Order.aggregate([
        { $match: match },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            image: { $first: "$items.image" },
            unitsSold: { $sum: "$items.quantity" },
            revenue: { $sum: "$items.totalPrice" }
          }
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            name: 1,
            image: 1,
            unitsSold: 1,
            revenue: 1
          }
        }
      ])
    ]);

    const summary = summaryResult[0] ?? {
      totalRevenue: 0,
      totalOrders: 0,
      unitsSold: 0
    };

    return {
      summary,
      topProducts
    };
  }
};

export default reportService;
