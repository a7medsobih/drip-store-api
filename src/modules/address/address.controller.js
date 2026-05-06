import ApiResponse from "../../utils/ApiResponse.js";
import addressService from "./address.service.js";

const addressController = {
  async getUserAddresses(req, res, next) {
    try {
      const addresses = await addressService.getUserAddresses(req.user.id);

      res
        .status(200)
        .json(new ApiResponse(200, "Addresses fetched successfully", addresses, null));
    } catch (error) {
      next(error);
    }
  },

  async getAddressById(req, res, next) {
    try {
      const address = await addressService.getAddressById(req.user.id, req.params.id);

      res
        .status(200)
        .json(new ApiResponse(200, "Address fetched successfully", address, null));
    } catch (error) {
      next(error);
    }
  },

  async createAddress(req, res, next) {
    try {
      const address = await addressService.createAddress(req.user.id, req.body);

      res
        .status(201)
        .json(new ApiResponse(201, "Address created successfully", address, null));
    } catch (error) {
      next(error);
    }
  },

  async updateAddress(req, res, next) {
    try {
      const address = await addressService.updateAddress(
        req.user.id,
        req.params.id,
        req.body
      );

      res
        .status(200)
        .json(new ApiResponse(200, "Address updated successfully", address, null));
    } catch (error) {
      next(error);
    }
  },

  async deleteAddress(req, res, next) {
    try {
      await addressService.deleteAddress(req.user.id, req.params.id);

      res
        .status(200)
        .json(new ApiResponse(200, "Address deleted successfully", null, null));
    } catch (error) {
      next(error);
    }
  }
};

export default addressController;
