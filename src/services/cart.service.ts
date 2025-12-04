import { v4 as uuidv4 } from 'uuid';
import cartSchema from '../models/cart.model';
import productSchema from '../models/product.model';
import { ApiError } from '../utils/apiError';

const addProduct = async (userId: string, productId: string) => {
  const productExists = await productSchema.findById({ productId });
  if (!productExists) {
    throw new ApiError('Product not found with id: ' + productId, 400);
  }

  const idOfProduct = productId;
  const existingCartItem = await cartSchema.findOne({ userId: userId, productId: productId });

  if (existingCartItem) {
    throw new ApiError('Product already exists in cart', 400);
  }

  const addedCartItem = await cartSchema.create({
    userId,
    productId
    // cartId: uuidv4()
  });
  if (!addedCartItem) {
    throw new ApiError('Error adding product to cart', 500);
  }
  return addedCartItem;
};

const getCartItemsByUserId = async (userId: string) => {
  const cartItems = await cartSchema.find({ userId: userId });
  if (!cartItems) {
    throw new ApiError('No cart items found for user with id: ' + userId, 404);
  }
  const productIds = cartItems.map((item) => item.productId);
  const products = await Promise.all(
    productIds.map(async (productId) => await productSchema.findById(productId))
  );

  return products;
};

const removeFromCart = async (userId: string, productId: string) => {
  const productExists = await productSchema.findById(productId);
  if (!productExists) {
    throw new ApiError('Product not found with id: ' + productId, 400);
  }

  const product = productId;

  const record = await cartSchema.findOne({ productId: product, userId: userId });

  if (!record) {
    throw new ApiError(
      'Product:' + product + ' does not exists in the cart of user: ' + userId,
      400
    );
  }
  const removedItem = await cartSchema.deleteOne();
  return removedItem;
};

export { addProduct, getCartItemsByUserId, removeFromCart };
