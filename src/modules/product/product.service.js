// src/modules/product/product.service.js
import Category from "../../models/Category.model.js";
import Order from "../../models/Order.model.js";
import Product from "../../models/Product.model.js";
import Subcategory from "../../models/Subcategory.model.js";
import AppError from "../../utils/AppError.js";
import { deleteCache, getCache, setCache } from "../../utils/cache.utils.js";

const BEST_SELLERS_CACHE_KEY = "products:best-sellers";
const NEW_ARRIVALS_CACHE_KEY = "products:new-arrivals";
const CACHE_TTL_SECONDS = 5 * 60;

const clearProductCaches = () => {
  deleteCache(BEST_SELLERS_CACHE_KEY);
  deleteCache(NEW_ARRIVALS_CACHE_KEY);
};

const getActiveCategoryById = async (categoryId) => {
  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
    isDeleted: false
  });

  if (!category) {
    throw new AppError("Category not found or inactive", 400);
  }

  return category;
};

const getActiveSubcategoryById = async (subCategoryId) => {
  const subcategory = await Subcategory.findOne({
    _id: subCategoryId,
    isActive: true,
    isDeleted: false
  });

  if (!subcategory) {
    throw new AppError("Subcategory not found or inactive", 400);
  }

  return subcategory;
};

const validateCategoryAndSubcategory = async (categoryId, subCategoryId) => {
  const [category, subcategory] = await Promise.all([
    getActiveCategoryById(categoryId),
    getActiveSubcategoryById(subCategoryId)
  ]);

  if (subcategory.categoryId.toString() !== category._id.toString()) {
    throw new AppError("Subcategory does not belong to the selected category", 400);
  }
};

const buildPublicProductQuery = (filters) => {
  const query = {
    isActive: true,
    isDeleted: false
  };

  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }

  if (filters.subCategoryId) {
    query.subCategoryId = filters.subCategoryId;
  }

  if (filters.search) {
    query.name = { $regex: filters.search, $options: "i" };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};

    if (filters.minPrice !== undefined) {
      query.price.$gte = filters.minPrice;
    }

    if (filters.maxPrice !== undefined) {
      query.price.$lte = filters.maxPrice;
    }
  }

  return query;
};

const getSortOption = (sort) => {
  if (sort === "price_asc") {
    return { price: 1 };
  }

  if (sort === "price_desc") {
    return { price: -1 };
  }

  return { createdAt: -1 };
};

const getImagePath = (file) => {
  if (!file) {
    return null;
  }

  return `/uploads/products/${file.filename}`;
};

const parseBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return value;
};

const parseProductPayload = (payload, file) => {
  const parsedPayload = {};

  if ("name" in payload) {
    parsedPayload.name = payload.name.trim();
  }

  if ("description" in payload) {
    parsedPayload.description = payload.description.trim();
  }

  if ("price" in payload) {
    parsedPayload.price = Number(payload.price);
  }

  if ("stock" in payload) {
    parsedPayload.stock = Number(payload.stock);
  }

  if ("categoryId" in payload) {
    parsedPayload.categoryId = payload.categoryId;
  }

  if ("subCategoryId" in payload) {
    parsedPayload.subCategoryId = payload.subCategoryId;
  }

  if ("isActive" in payload) {
    parsedPayload.isActive = parseBoolean(payload.isActive);
  }

  const imagePath = getImagePath(file);
  if (imagePath) {
    parsedPayload.image = imagePath;
  }

  return parsedPayload;
};

const productService = {
  async createProduct(payload, file) {
    const parsedPayload = parseProductPayload(payload, file);

    await validateCategoryAndSubcategory(
      parsedPayload.categoryId,
      parsedPayload.subCategoryId
    );

    const product = await Product.create(parsedPayload);

    clearProductCaches();

    return product;
  },

  async updateProduct(productId, payload, file) {
    const product = await Product.findOne({ _id: productId, isDeleted: false });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const parsedPayload = parseProductPayload(payload, file);
    const categoryId = parsedPayload.categoryId ?? product.categoryId.toString();
    const subCategoryId =
      parsedPayload.subCategoryId ?? product.subCategoryId.toString();

    if ("categoryId" in parsedPayload || "subCategoryId" in parsedPayload) {
      await validateCategoryAndSubcategory(categoryId, subCategoryId);
    }

    Object.assign(product, parsedPayload);
    await product.save();

    clearProductCaches();

    return product;
  },

  async deleteProduct(productId) {
    const product = await Product.findOne({ _id: productId, isDeleted: false });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    product.isDeleted = true;
    product.isActive = false;
    await product.save();

    clearProductCaches();

    return null;
  },

  async getProducts(queryParams) {
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 10;
    const skip = (page - 1) * limit;

    const filters = {
      categoryId: queryParams.categoryId,
      subCategoryId: queryParams.subCategoryId ?? queryParams.subcategoryId,
      minPrice:
        queryParams.minPrice !== undefined ? Number(queryParams.minPrice) : undefined,
      maxPrice:
        queryParams.maxPrice !== undefined ? Number(queryParams.maxPrice) : undefined,
      search: (queryParams.search ?? queryParams.name)?.trim()
    };

    const query = buildPublicProductQuery(filters);
    const sort = getSortOption(queryParams.sort);

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(query)
    ]);

    return {
      items: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  async getBestSellers() {
    const cachedProducts = getCache(BEST_SELLERS_CACHE_KEY);
    if (cachedProducts) {
      return cachedProducts;
    }

    const bestSellers = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $match: {
          "product.isActive": true,
          "product.isDeleted": false
        }
      },
      { $limit: 10 },
      {
        $project: {
          _id: "$product._id",
          name: "$product.name",
          description: "$product.description",
          price: "$product.price",
          image: "$product.image",
          stock: "$product.stock",
          categoryId: "$product.categoryId",
          subCategoryId: "$product.subCategoryId",
          isActive: "$product.isActive",
          isDeleted: "$product.isDeleted",
          createdAt: "$product.createdAt",
          updatedAt: "$product.updatedAt",
          totalSold: 1
        }
      }
    ]);

    setCache(BEST_SELLERS_CACHE_KEY, bestSellers, CACHE_TTL_SECONDS);

    return bestSellers;
  },

  async getNewArrivals() {
    const cachedProducts = getCache(NEW_ARRIVALS_CACHE_KEY);
    if (cachedProducts) {
      return cachedProducts;
    }

    const newArrivals = await Product.find({
      isActive: true,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    setCache(NEW_ARRIVALS_CACHE_KEY, newArrivals, CACHE_TTL_SECONDS);

    return newArrivals;
  }
};

export default productService;
