import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/apiError';
import {
  addProductToWishlist,
  getWishlistItemsByUserId,
  removeProductFromWishlist
} from '../services/wishlist.service';

export const addToWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { productId } = req.body;

  if (!userId) throw new ApiError('Login required', 401);
  if (!productId) throw new ApiError('Product ID is required', 400);

  const result = await addProductToWishlist(userId, productId);
  res.status(201).json({ message: 'Added to wishlist', wishlistItem: result });
});

export const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) throw new ApiError('Login required', 401);

  const products = await getWishlistItemsByUserId(userId);
  res.status(200).json({ wishlist: products });
});

export const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { productId } = req.params;

  if (!userId) throw new ApiError('Login required', 401);
  if (!productId) throw new ApiError('Product ID is required', 400);

  await removeProductFromWishlist(userId, productId);
  res.status(200).json({ message: 'Removed from wishlist' });
});
