import Category from "../../models/Category.model.js";
import Subcategory from "../../models/Subcategory.model.js";
import AppError from "../../utils/AppError.js";

const getNormalizedTitle = (title) => title.trim();

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

const subcategoryService = {
  async getPublicSubcategoriesByCategoryId(categoryId) {
    await getActiveCategoryById(categoryId);

    return Subcategory.find({
      categoryId,
      isActive: true,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .lean();
  },

  async createSubcategory(payload) {
    await getActiveCategoryById(payload.categoryId);

    const subcategory = await Subcategory.create({
      title: getNormalizedTitle(payload.title),
      categoryId: payload.categoryId,
      isActive: payload.isActive ?? true
    });

    return subcategory;
  },

  async updateSubcategory(subcategoryId, payload) {
    const subcategory = await Subcategory.findOne({
      _id: subcategoryId,
      isDeleted: false
    });

    if (!subcategory) {
      throw new AppError("Subcategory not found", 404);
    }

    if ("categoryId" in payload) {
      await getActiveCategoryById(payload.categoryId);
      subcategory.categoryId = payload.categoryId;
    }

    if ("title" in payload) {
      subcategory.title = getNormalizedTitle(payload.title);
    }

    if ("isActive" in payload) {
      subcategory.isActive = payload.isActive;
    }

    await subcategory.save();

    return subcategory;
  },

  async deleteSubcategory(subcategoryId) {
    const subcategory = await Subcategory.findOne({
      _id: subcategoryId,
      isDeleted: false
    });

    if (!subcategory) {
      throw new AppError("Subcategory not found", 404);
    }

    subcategory.isDeleted = true;
    subcategory.isActive = false;
    await subcategory.save();

    return null;
  }
};

export default subcategoryService;
