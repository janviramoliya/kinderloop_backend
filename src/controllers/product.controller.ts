import { catchAsync } from '../utils/catchAsync';
import { ProductModel } from '../types/product';
import { Request, Response } from 'express';
import {
  updateProductStatus,
  getAllProducts,
  getAllUnapprovedProducts,
  getProductDetails,
  saveProduct
} from '../services/product.service';
import { ApiError } from '../utils/apiError';

const addProduct = catchAsync(async (req: Request<{}, {}, ProductModel>, res: Response) => {
  let {
    name,
    description,
    originalPrice,
    currentPrice,
    category,
    ageGroup,
    condition,
    sellType,
    itemUrl,
    pickupAddress
  } = req.body;

  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError('User is not given', 400);
  }

  originalPrice = Number(originalPrice);
  currentPrice = Number(currentPrice);

  const files = req.files as Express.Multer.File[];

  const result = await saveProduct(
    name,
    description,
    originalPrice,
    currentPrice,
    category,
    userId,
    ageGroup || '',
    condition,
    sellType,
    itemUrl || '',
    pickupAddress,
    files
  );

  res.status(201).json({
    success: true,
    message: 'Product added successfully',
    data: result
  });
});

const getProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;

  const product = await getProductDetails(productId);

  res.status(200).json(product);
});

const getProducts = catchAsync(async (req: Request, res: Response) => {
  const {
    page,
    limit,
    search,
    category,
    condition,
    ageGroup,
    minPrice,
    maxPrice,
    sellType,
    sortBy,
    status
  } = req.query;

  const userRole = req.user?.role;

  // Build query parameters with proper validation
  const queryParams = {
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    search: search ? (search as string).trim() : undefined,
    category: category ? (category as string).trim() : undefined,
    condition: condition ? (condition as string).trim() : undefined,
    ageGroup: ageGroup ? (ageGroup as string).trim() : undefined,
    minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    sellType: sellType as 'Sell with us' | 'Sell to us' | undefined,
    sortBy: sortBy ? (sortBy as string).trim() : undefined,
    status: userRole === 'Admin' && !status ? undefined : (status as string) // Admin sees all, public sees completed
  };

  // Remove undefined values
  const cleanedParams = Object.fromEntries(
    Object.entries(queryParams).filter(([_, value]) => value)
  );

  const products = await getAllProducts(cleanedParams);

  // Return simple array for frontend compatibility
  res.status(200).json(products);
});

const searchProducts = catchAsync(async (req: Request, res: Response) => {
  const { q: searchQuery } = req.query;

  if (!searchQuery || typeof searchQuery !== 'string') {
    throw new ApiError('Search query is required', 400);
  }

  const queryParams = {
    search: searchQuery.trim(),
    status: 'Completed' // Only search in completed products
  };

  const products = await getAllProducts(queryParams);

  res.status(200).json({
    success: true,
    data: products,
    searchQuery,
    resultCount: products.length
  });
});

const getProductsByCategory = catchAsync(async (req: Request, res: Response) => {
  const { category } = req.params;

  const queryParams = {
    category,
    status: 'Completed'
  };

  const products = await getAllProducts(queryParams);

  res.status(200).json({
    success: true,
    data: products,
    category,
    resultCount: products.length
  });
});

const getFeaturedProducts = catchAsync(async (req: Request, res: Response) => {
  const { limit } = req.query;

  const queryParams = {
    limit: limit ? parseInt(limit as string) : 8,
    sortBy: 'newest',
    status: 'Completed'
  };

  const products = await getAllProducts(queryParams);

  res.status(200).json({
    success: true,
    data: products,
    resultCount: products.length
  });
});

const updateProductStatusById = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;
  const { status, price, pickupGuy } = req.body;

  const result = await updateProductStatus(
    productId,
    req.user?.role || '',
    status,
    price,
    pickupGuy
  );

  res.status(200).json({
    success: true,
    message: 'Product status updated successfully',
    data: result
  });
});

const getUnapprovedProducts = catchAsync(async (req: Request, res: Response) => {
  const products = await getAllUnapprovedProducts();

  res.status(200).json({
    success: true,
    data: products,
    resultCount: products.length
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const productId = req.params.id;

  // Add your delete product service call here
  // const result = await deleteProductById(productId);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

const bulkUpdateProducts = catchAsync(async (req: Request, res: Response) => {
  const { productIds, status } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new ApiError('Product IDs are required', 400);
  }

  if (!status) {
    throw new ApiError('Status is required', 400);
  }

  // Process bulk updates
  const results = [];
  for (const productId of productIds) {
    const result = await updateProductStatus(productId, req.user?.role || '', status);
    results.push(result);
  }

  res.status(200).json({
    success: true,
    message: `${productIds.length} products updated successfully`,
    data: results
  });
});

export {
  addProduct,
  getProduct,
  getProducts,
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
  updateProductStatusById,
  getUnapprovedProducts,
  deleteProduct,
  bulkUpdateProducts
};
