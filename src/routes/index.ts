import express from 'express';
import authRoutes from './auth.routes';
import uploadRoutes from './upload.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import addressRoutes from './address.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import contactRoutes from './contact.routes';

const router = express.Router();

/**
 * === API Routes ===
 * - All API endpoints go here.
 */
router.use('/api/users', authRoutes);
router.use('/api/upload', uploadRoutes);
router.use('/api/products', productRoutes);
router.use('/api/order', orderRoutes);
router.use('/api/address', addressRoutes);
router.use('/api/cart', cartRoutes);
router.use('/api/wishlist', wishlistRoutes);
router.use('/api/contact', contactRoutes);

export default router;
