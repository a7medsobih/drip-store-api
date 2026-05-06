import Category from "../../models/Category.model.js";
import Product from "../../models/Product.model.js";
import Subcategory from "../../models/Subcategory.model.js";
import AppError from "../../utils/AppError.js";

const getNormalizedTitle = (title) => title.trim();

const ensureUniqueCategoryTitle = async (title, excludedId = null) => {
  const query = { title };

  if (excludedId) {
    query._id = { $ne: excludedId };
  }

  const existingCategory = await Category.findOne(query);
  if (existingCategory) {
    throw new AppError("Category title already exists", 409);
  }
};

const softDeleteSubcategoriesByCategoryId = async (categoryId) => {
  await Subcategory.updateMany(
    { categoryId, isDeleted: false },
    { $set: { isDeleted: true, isActive: false } }
  );
};

const deactivateProductsByCategoryId = async (categoryId) => {
  await Product.updateMany({ categoryId }, { $set: { isActive: false } });
};

const categoryService = {
  async getPublicCategories() {
    return Category.find({ isActive: true, isDeleted: false })
      .sort({ createdAt: -1 })
      .lean();
  },

  async createCategory(payload) {
    const normalizedTitle = getNormalizedTitle(payload.title);

    await ensureUniqueCategoryTitle(normalizedTitle);

    const category = await Category.create({
      title: normalizedTitle,
      isActive: payload.isActive ?? true
    });

    return category;
  },

  async updateCategory(categoryId, payload) {
    const category = await Category.findOne({ _id: categoryId, isDeleted: false });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if ("title" in payload) {
      const normalizedTitle = getNormalizedTitle(payload.title);
      await ensureUniqueCategoryTitle(normalizedTitle, categoryId);
      category.title = normalizedTitle;
    }

    if ("isActive" in payload) {
      category.isActive = payload.isActive;
    }

    await category.save();

    return category;
  },

  async deleteCategory(categoryId) {
    const category = await Category.findOne({ _id: categoryId, isDeleted: false });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    category.isDeleted = true;
    category.isActive = false;
    await category.save();

    await softDeleteSubcategoriesByCategoryId(categoryId);
    await deactivateProductsByCategoryId(categoryId);

    return null;
  }
};

export default categoryService;
