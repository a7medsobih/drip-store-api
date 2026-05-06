import Address from "../../models/Address.model.js";
import AppError from "../../utils/AppError.js";

const resetOtherDefaultAddresses = async (userId, currentAddressId) => {
  await Address.updateMany(
    {
      userId,
      _id: { $ne: currentAddressId },
      isDefault: true
    },
    {
      $set: { isDefault: false }
    }
  );
};

const assignFirstAvailableAddressAsDefault = async (userId) => {
  const defaultAddress = await Address.findOne({ userId, isDefault: true });

  if (defaultAddress) {
    return;
  }

  const fallbackAddress = await Address.findOne({ userId }).sort({ createdAt: 1 });

  if (!fallbackAddress) {
    return;
  }

  fallbackAddress.isDefault = true;
  await fallbackAddress.save();
};

const addressService = {
  async getUserAddresses(userId) {
    return Address.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  async getAddressById(userId, addressId) {
    const address = await Address.findOne({ _id: addressId, userId }).lean();

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    return address;
  },

  async createAddress(userId, payload) {
    const existingAddressesCount = await Address.countDocuments({ userId });
    const shouldBeDefault =
      existingAddressesCount === 0 || payload.isDefault === true;

    const address = new Address({
      userId,
      label: payload.label,
      addressText: payload.addressText.trim(),
      isDefault: shouldBeDefault
    });

    await address.save();

    if (shouldBeDefault) {
      await resetOtherDefaultAddresses(userId, address._id);
    }

    return this.getAddressById(userId, address._id);
  },

  async updateAddress(userId, addressId, payload) {
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    if ("label" in payload) {
      address.label = payload.label;
    }

    if ("addressText" in payload) {
      address.addressText = payload.addressText.trim();
    }

    if ("isDefault" in payload) {
      address.isDefault = payload.isDefault;
    }

    await address.save();

    if (payload.isDefault === true) {
      await resetOtherDefaultAddresses(userId, address._id);
    } else {
      await assignFirstAvailableAddressAsDefault(userId);
    }

    return this.getAddressById(userId, addressId);
  },

  async deleteAddress(userId, addressId) {
    const address = await Address.findOne({ _id: addressId, userId });

    if (!address) {
      throw new AppError("Address not found", 404);
    }

    const wasDefault = address.isDefault;
    await address.deleteOne();

    if (wasDefault) {
      await assignFirstAvailableAddressAsDefault(userId);
    }

    return null;
  }
};

export default addressService;
