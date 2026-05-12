import Cart from "../../models/Cart.model.js";
import Product from "../../models/Product.model.js";
import AppError from "../../utils/AppError.js";

const calculateTotalPrice = (price, quantity) => price * quantity;

const getActiveProduct = async (productId) => {
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
    isDeleted: false
  }).lean();

  if (!product) {
    throw new AppError("Product not found or inactive", 400);
  }

  return product;
};

const buildCartSummary = (items) => {
  return items.reduce(
    (summary, item) => {
      summary.subtotal += item.totalPrice;
      summary.itemsCount += item.quantity;
      return summary;
    },
    { subtotal: 0, itemsCount: 0 }
  );
};

const buildProductMap = (products) => {
  return new Map(products.map((product) => [product._id.toString(), product]));
};

const formatCartItem = (item, product) => ({
  _id: item._id,
  userId: item.userId,
  productId: item.productId,
  quantity: item.quantity,
  price: item.price,
  totalPrice: item.totalPrice,
  isPriceChanged: item.isPriceChanged,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  product: product
    ? {
        _id: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        stock: product.stock
      }
    : null
});

const buildCartResponse = (items, productMap = new Map()) => {
  const formattedItems = items.map((item) =>
    formatCartItem(item, productMap.get(item.productId.toString()) ?? null)
  );

  return {
    items: formattedItems,
    summary: buildCartSummary(formattedItems)
  };
};

const syncCartItem = (cartItem, product) => {
  if (!product || product.stock < 1) {
    return { shouldDelete: true, shouldSave: false };
  }

  let shouldSave = false;
  const priceChanged = cartItem.price !== product.price;

  if (priceChanged) {
    cartItem.price = product.price;
    cartItem.isPriceChanged = true;
    shouldSave = true;
  } else if (cartItem.isPriceChanged) {
    cartItem.isPriceChanged = false;
    shouldSave = true;
  }

  if (cartItem.quantity > product.stock) {
    cartItem.quantity = product.stock;
    shouldSave = true;
  }

  if (cartItem.quantity < 1) {
    return { shouldDelete: true, shouldSave: false };
  }

  const totalPrice = calculateTotalPrice(cartItem.price, cartItem.quantity);

  if (cartItem.totalPrice !== totalPrice) {
    cartItem.totalPrice = totalPrice;
    shouldSave = true;
  }

  return { shouldDelete: false, shouldSave };
};

const normalizeMergeItems = (items) => {
  const mergedItems = new Map();

  for (const item of items) {
    const productId = item.productId.toString();
    const currentQuantity = mergedItems.get(productId) ?? 0;

    mergedItems.set(productId, currentQuantity + item.quantity);
  }

  return mergedItems;
};

const cartService = {
  async getCart(userId) {
    const cartItems = await Cart.find({ userId }).sort({ createdAt: -1 });

    if (cartItems.length === 0) {
      return buildCartResponse([]);
    }

    const productIds = cartItems.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
      isDeleted: false
    }).lean();

    const productMap = buildProductMap(products);
    const validItems = [];

    for (const cartItem of cartItems) {
      const product = productMap.get(cartItem.productId.toString()) ?? null;
      const syncResult = syncCartItem(cartItem, product);

      if (syncResult.shouldDelete) {
        await cartItem.deleteOne();
        continue;
      }

      if (syncResult.shouldSave) {
        await cartItem.save();
      }

      validItems.push(cartItem.toObject());
    }

    return buildCartResponse(validItems, productMap);
  },

  async addToCart(userId, payload) {
    const product = await getActiveProduct(payload.productId);

    if (payload.quantity > product.stock) {
      throw new AppError("Insufficient stock", 400);
    }

    const existingCartItem = await Cart.findOne({
      userId,
      productId: payload.productId
    });

    if (existingCartItem) {
      const mergedQuantity = existingCartItem.quantity + payload.quantity;

      if (mergedQuantity > product.stock) {
        throw new AppError("Insufficient stock", 400);
      }

      const priceChanged = existingCartItem.price !== product.price;

      existingCartItem.quantity = mergedQuantity;
      existingCartItem.price = product.price;
      existingCartItem.totalPrice = calculateTotalPrice(product.price, mergedQuantity);
      existingCartItem.isPriceChanged = priceChanged;

      await existingCartItem.save();
    } else {
      await Cart.create({
        userId,
        productId: payload.productId,
        quantity: payload.quantity,
        price: product.price,
        totalPrice: calculateTotalPrice(product.price, payload.quantity),
        isPriceChanged: false
      });
    }

    return this.getCart(userId);
  },

  async updateCartItem(userId, cartItemId, payload) {
    const cartItem = await Cart.findOne({ _id: cartItemId, userId });

    if (!cartItem) {
      throw new AppError("Cart item not found", 404);
    }

    const product = await getActiveProduct(cartItem.productId);

    if (payload.quantity > product.stock) {
      throw new AppError("Insufficient stock", 400);
    }

    const priceChanged = cartItem.price !== product.price;

    cartItem.quantity = payload.quantity;
    cartItem.price = product.price;
    cartItem.totalPrice = calculateTotalPrice(product.price, payload.quantity);
    cartItem.isPriceChanged = priceChanged;

    await cartItem.save();

    return this.getCart(userId);
  },

  async deleteCartItem(userId, cartItemId) {
    const cartItem = await Cart.findOne({ _id: cartItemId, userId });

    if (!cartItem) {
      throw new AppError("Cart item not found", 404);
    }

    await cartItem.deleteOne();

    return this.getCart(userId);
  },

  async clearCart(userId) {
    await Cart.deleteMany({ userId });

    return buildCartResponse([]);
  },

  async mergeGuestCart(userId, items) {
    if (items.length === 0) {
      return this.getCart(userId);
    }

    const normalizedItems = normalizeMergeItems(items);
    const productIds = [...normalizedItems.keys()];

    const [products, existingCartItems] = await Promise.all([
      Product.find({
        _id: { $in: productIds },
        isActive: true,
        isDeleted: false
      }).lean(),
      Cart.find({
        userId,
        productId: { $in: productIds }
      })
    ]);

    const productMap = buildProductMap(products);
    const existingCartItemMap = new Map(
      existingCartItems.map((item) => [item.productId.toString(), item])
    );

    for (const [productId, quantity] of normalizedItems) {
      const product = productMap.get(productId);

      if (!product || product.stock < 1) {
        continue;
      }

      const existingCartItem = existingCartItemMap.get(productId) ?? null;
      const currentQuantity = existingCartItem ? existingCartItem.quantity : 0;
      const mergedQuantity = Math.min(currentQuantity + quantity, product.stock);

      if (mergedQuantity < 1) {
        continue;
      }

      if (existingCartItem) {
        const priceChanged = existingCartItem.price !== product.price;

        existingCartItem.quantity = mergedQuantity;
        existingCartItem.price = product.price;
        existingCartItem.totalPrice = calculateTotalPrice(
          product.price,
          mergedQuantity
        );
        existingCartItem.isPriceChanged = priceChanged;

        await existingCartItem.save();
        continue;
      }

      await Cart.create({
        userId,
        productId,
        quantity: mergedQuantity,
        price: product.price,
        totalPrice: calculateTotalPrice(product.price, mergedQuantity),
        isPriceChanged: false
      });
    }

    return this.getCart(userId);
  }
};

export default cartService;
