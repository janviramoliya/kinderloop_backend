import { v4 as uuidv4 } from 'uuid';
import wishlistSchema from '../models/wishlist.model';
import productSchema from '../models/product.model';
import { ApiError } from '../utils/apiError';

export const addProductToWishlist = async (userId: string, productId: string) => {
  const product = await productSchema.findById(productId);
  if (!product) {
    throw new ApiError('Product not found', 404);
  }

  const existing = await wishlistSchema.find({ userId, productId });

  // const existing = await WishlistEntity.query
  //   .wishlistByUser({ gsi1pk: userId })
  //   .where((attr, { eq }) => eq(attr.productId, productId))
  //   .go();

  if (!existing || existing.length > 0) {
    throw new ApiError('Product already in wishlist', 400);
  }

  const wishlistItem = await wishlistSchema.create({
    wishlistId: uuidv4(),
    userId,
    productId
  });

  return wishlistItem;
};

export const getWishlistItemsByUserId = async (userId: string) => {
  const items = await wishlistSchema.find({ userId });
  const productIds = items.map((item) => item.productId);

  const products = await Promise.all(
    productIds.map(async (id) => {
      const result = await productSchema.findById(id);
      return result;
    })
  );

  return products.filter(Boolean); // remove null/undefined
};

export const removeProductFromWishlist = async (userId: string, productId: string) => {
  const existing = await wishlistSchema.find({ productId, userId });

  if (!existing.length) {
    throw new ApiError('Product not found in wishlist', 404);
  }

  await wishlistSchema.deleteOne({ wishlistId: existing[0].wishlistId });
};
