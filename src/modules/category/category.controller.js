import ApiResponse from "../../utils/ApiResponse.js";
import categoryService from "./category.service.js";

const categoryController = {
  async getPublicCategories(req, res, next) {
    try {
      const categories = await categoryService.getPublicCategories();

      res
        .status(200)
        .json(new ApiResponse(200, "Categories fetched successfully", categories));
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body);

      res
        .status(201)
        .json(new ApiResponse(201, "Category created successfully", category));
    } catch (error) {
      next(error);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);

      res
        .status(200)
        .json(new ApiResponse(200, "Category updated successfully", category));
    } catch (error) {
      next(error);
    }
  },

  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id);

      res
        .status(200)
        .json(new ApiResponse(200, "Category deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
};

export default categoryController;
