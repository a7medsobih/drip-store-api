import ApiResponse from "../../utils/ApiResponse.js";
import productService from "./product.service.js";

const productController = {
  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.body, req.file);

      res
        .status(201)
        .json(new ApiResponse(201, "Product created successfully", product, null));
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(
        req.params.id,
        req.body,
        req.file
      );

      res
        .status(200)
        .json(new ApiResponse(200, "Product updated successfully", product, null));
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);

      res
        .status(200)
        .json(new ApiResponse(200, "Product deleted successfully", null, null));
    } catch (error) {
      next(error);
    }
  },

  async getProducts(req, res, next) {
    try {
      const products = await productService.getProducts(req.query);

      res
        .status(200)
        .json(new ApiResponse(200, "Products fetched successfully", products, null));
    } catch (error) {
      next(error);
    }
  },

  async getBestSellers(req, res, next) {
    try {
      const products = await productService.getBestSellers();

      res
        .status(200)
        .json(
          new ApiResponse(200, "Best sellers fetched successfully", products, null)
        );
    } catch (error) {
      next(error);
    }
  },

  async getNewArrivals(req, res, next) {
    try {
      const products = await productService.getNewArrivals();

      res
        .status(200)
        .json(
          new ApiResponse(200, "New arrivals fetched successfully", products, null)
        );
    } catch (error) {
      next(error);
    }
  }
};

export default productController;
