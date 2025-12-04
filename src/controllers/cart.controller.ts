import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/apiError';
import { addProduct, getCartItemsByUserId, removeFromCart } from '../services/cart.service';

const addProductToCart = catchAsync(async (req: Request<{}, {}>, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError('Login is compulsory for adding products to cart', 400);
  }

  const { productId } = req.body;

  const result = await addProduct(userId, productId);

  res.status(201).json({ status: 'Product added to cart successfully', cartItem: result });
});

const getCartItems = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError('Login is compulsory for getting cart items', 400);
  }

  const result = await getCartItemsByUserId(userId);

  res.status(200).json(result);
});

const removeItemFromCart = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError('Login is compulsory for removing items from cart', 400);
  }
  const { productId } = req.body;
  const result = await removeFromCart(userId, productId);
  res.status(200).json({ status: 'Product removed from cart successfully', cartItem: result });
});

export { addProductToCart, getCartItems, removeItemFromCart };
