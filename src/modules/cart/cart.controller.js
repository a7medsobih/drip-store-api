import ApiResponse from "../../utils/ApiResponse.js";
import cartService from "./cart.service.js";

const cartController = {
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.user.id);

      res
        .status(200)
        .json(new ApiResponse(200, "Cart fetched successfully", cart, null));
    } catch (error) {
      next(error);
    }
  },

  async addToCart(req, res, next) {
    try {
      const cart = await cartService.addToCart(req.user.id, req.body);

      res
        .status(201)
        .json(new ApiResponse(201, "Item added to cart successfully", cart, null));
    } catch (error) {
      next(error);
    }
  },

  async updateCartItem(req, res, next) {
    try {
      const cart = await cartService.updateCartItem(
        req.user.id,
        req.params.id,
        req.body
      );

      res
        .status(200)
        .json(new ApiResponse(200, "Cart item updated successfully", cart, null));
    } catch (error) {
      next(error);
    }
  },

  async deleteCartItem(req, res, next) {
    try {
      const cart = await cartService.deleteCartItem(req.user.id, req.params.id);

      res
        .status(200)
        .json(new ApiResponse(200, "Cart item deleted successfully", cart, null));
    } catch (error) {
      next(error);
    }
  },

  async clearCart(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.user.id);

      res
        .status(200)
        .json(new ApiResponse(200, "Cart cleared successfully", cart, null));
    } catch (error) {
      next(error);
    }
  },

  async mergeGuestCart(req, res, next) {
    try {
      const cart = await cartService.mergeGuestCart(req.user.id, req.body.items);

      res
        .status(200)
        .json(new ApiResponse(200, "Guest cart merged successfully", cart, null));
    } catch (error) {
      next(error);
    }
  }
};

export default cartController;
