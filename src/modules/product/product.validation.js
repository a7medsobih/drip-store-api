// src/modules/product/product.validation.js
import mongoose from "mongoose";

const getValidationError = (message) => ({
  error: message
});

const isBooleanLike = (value) => {
  return (
    typeof value === "boolean" ||
    value === "true" ||
    value === "false"
  );
};

const validateObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return getValidationError(`Invalid ${fieldName}`);
  }

  return null;
};

const validateProductPayload = (req, { isUpdate = false } = {}) => {
  const { body } = req;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return getValidationError("Request body must be an object");
  }

  const allowedFields = [
    "name",
    "description",
    "price",
    "stock",
    "categoryId",
    "subCategoryId",
    "isActive"
  ];
  const bodyKeys = Object.keys(body);

  if (isUpdate && bodyKeys.length === 0 && !req.file) {
    return getValidationError("At least one field is required");
  }

  for (const key of bodyKeys) {
    if (!allowedFields.includes(key)) {
      return getValidationError(`Field '${key}' is not allowed`);
    }
  }

  if (!isUpdate) {
    const requiredFields = [
      "name",
      "description",
      "price",
      "stock",
      "categoryId",
      "subCategoryId"
    ];

    for (const field of requiredFields) {
      if (!(field in body)) {
        return getValidationError(`${field} is required`);
      }
    }

    if (!req.file) {
      return getValidationError("Product image is required");
    }
  }

  if ("name" in body) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      return getValidationError("Name must be a non-empty string");
    }
  }

  if ("description" in body) {
    if (
      typeof body.description !== "string" ||
      body.description.trim().length === 0
    ) {
      return getValidationError("Description must be a non-empty string");
    }
  }

  if ("price" in body) {
    const price = Number(body.price);
    if (Number.isNaN(price) || price < 0) {
      return getValidationError("Price must be a number greater than or equal to 0");
    }
  }

  if ("stock" in body) {
    const stock = Number(body.stock);
    if (!Number.isInteger(stock) || stock < 0) {
      return getValidationError("Stock must be an integer greater than or equal to 0");
    }
  }

  if ("categoryId" in body) {
    const categoryIdError = validateObjectId(body.categoryId, "category id");
    if (categoryIdError) {
      return categoryIdError;
    }
  }

  if ("subCategoryId" in body) {
    const subcategoryIdError = validateObjectId(
      body.subCategoryId,
      "subcategory id"
    );
    if (subcategoryIdError) {
      return subcategoryIdError;
    }
  }

  if ("isActive" in body && !isBooleanLike(body.isActive)) {
    return getValidationError("isActive must be a boolean");
  }

  return null;
};

const validateProductQuery = (req) => {
  const { page, limit, minPrice, maxPrice, sort } = req.query;
  const allowedSortValues = ["price_asc", "price_desc", "newest"];

  if (page !== undefined) {
    const parsedPage = Number(page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      return getValidationError("Page must be a positive integer");
    }
  }

  if (limit !== undefined) {
    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      return getValidationError("Limit must be a positive integer");
    }
  }

  if (minPrice !== undefined) {
    const parsedMinPrice = Number(minPrice);
    if (Number.isNaN(parsedMinPrice) || parsedMinPrice < 0) {
      return getValidationError("minPrice must be a number greater than or equal to 0");
    }
  }

  if (maxPrice !== undefined) {
    const parsedMaxPrice = Number(maxPrice);
    if (Number.isNaN(parsedMaxPrice) || parsedMaxPrice < 0) {
      return getValidationError("maxPrice must be a number greater than or equal to 0");
    }
  }

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    Number(minPrice) > Number(maxPrice)
  ) {
    return getValidationError("minPrice cannot be greater than maxPrice");
  }

  if (sort !== undefined && !allowedSortValues.includes(sort)) {
    return getValidationError("Sort must be one of price_asc, price_desc, or newest");
  }

  if (req.query.categoryId) {
    const categoryIdError = validateObjectId(req.query.categoryId, "category id");
    if (categoryIdError) {
      return categoryIdError;
    }
  }

  const subcategoryFilter = req.query.subCategoryId ?? req.query.subcategoryId;

  if (subcategoryFilter) {
    const subcategoryIdError = validateObjectId(
      subcategoryFilter,
      "subcategory id"
    );
    if (subcategoryIdError) {
      return subcategoryIdError;
    }
  }

  return null;
};

const productValidation = {
  createProduct: (req) => validateProductPayload(req),
  updateProduct: (req) => validateProductPayload(req, { isUpdate: true }),
  productId: (req) => validateObjectId(req.params.id, "product id"),
  getProducts: validateProductQuery
};

export default productValidation;
