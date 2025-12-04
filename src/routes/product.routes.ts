import { Router } from 'express';
import { validateRequest } from '../middlewares/validate-request.middleware';
import {
  addProduct,
  updateProductStatusById,
  getProduct,
  getProducts,
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
  getUnapprovedProducts,
  deleteProduct,
  bulkUpdateProducts
} from '../controllers/product.controller';
import { productSchema } from '../validators/product.validator';
import { upload } from '../utils/multer';
import authenticateUser from '../middlewares/authenticateUser';
import authorizePermission from '../middlewares/authorizePermission';
import { Roles } from '../constants/roles';

const router = Router();

// Public routes (temporarily without query validation)
router.get('/', getProducts); // Get products with filtering, search, sort
router.get('/search', searchProducts); // Quick search with 'q' parameter
router.get('/featured', getFeaturedProducts); // Get featured products
router.get('/category/:category', getProductsByCategory); // Get products by category
router.get('/:id', getProduct); // Get single product (must be last)

// Protected routes
router.post(
  '/add-product',
  authenticateUser,
  upload.array('images', 8),
  validateRequest(productSchema),
  addProduct
);

// Admin routes
router.get(
  '/admin/unapproved',
  authenticateUser,
  authorizePermission(Roles.ADMIN),
  getUnapprovedProducts
);

router.patch(
  '/admin/approve/:id',
  authenticateUser,
  authorizePermission(Roles.ADMIN, Roles.DELIVERY_BOY),
  updateProductStatusById
);

router.delete('/admin/:id', authenticateUser, authorizePermission(Roles.ADMIN), deleteProduct);

router.patch(
  '/admin/bulk-update',
  authenticateUser,
  authorizePermission(Roles.ADMIN),
  bulkUpdateProducts
);

export default router;
