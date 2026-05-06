import ApiResponse from "../../utils/ApiResponse.js";
import subcategoryService from "./subcategory.service.js";

const subcategoryController = {
  async getPublicSubcategoriesByCategoryId(req, res, next) {
    try {
      const subcategories =
        await subcategoryService.getPublicSubcategoriesByCategoryId(req.params.id);

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "Subcategories fetched successfully",
            subcategories
          )
        );
    } catch (error) {
      next(error);
    }
  },

  async createSubcategory(req, res, next) {
    try {
      const subcategory = await subcategoryService.createSubcategory(req.body);

      res
        .status(201)
        .json(
          new ApiResponse(201, "Subcategory created successfully", subcategory)
        );
    } catch (error) {
      next(error);
    }
  },

  async updateSubcategory(req, res, next) {
    try {
      const subcategory = await subcategoryService.updateSubcategory(
        req.params.id,
        req.body
      );

      res
        .status(200)
        .json(
          new ApiResponse(200, "Subcategory updated successfully", subcategory)
        );
    } catch (error) {
      next(error);
    }
  },

  async deleteSubcategory(req, res, next) {
    try {
      await subcategoryService.deleteSubcategory(req.params.id);

      res
        .status(200)
        .json(new ApiResponse(200, "Subcategory deleted successfully", null));
    } catch (error) {
      next(error);
    }
  }
};

export default subcategoryController;
