import { Router } from 'express';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { upload } from '../utils/multer';
import authenticateUser from '../middlewares/authenticateUser';
import {
  getAllOrders,
  placeOrder,
  updateOrderStatus,
  getAllOrdersAdmin,
  getOrder,
  getOrderDetailsForAdmin
} from '../controllers/order.controller';
import { orderSchema, orderStatusSchema } from '../validators/order.validator';
import authorizePermission from '../middlewares/authorizePermission';
import { Roles } from '../constants/roles';

const router = Router();

router.post(
  '/place-order',
  authenticateUser,
  upload.array('images', 8),
  validateRequest(orderSchema),
  placeOrder
);
router.get(
  '/',
  authenticateUser,
  authorizePermission(Roles.ADMIN, Roles.CUSTOMER, Roles.SELLER),
  getAllOrders
);
router.get('/admin', authenticateUser, authorizePermission(Roles.ADMIN), getAllOrdersAdmin);
router.get(
  '/admin/:id',
  authenticateUser,
  authorizePermission(Roles.ADMIN),
  getOrderDetailsForAdmin
);
router.get('/:id', authenticateUser, getOrder);
router.patch('/:id', authenticateUser, validateRequest(orderStatusSchema), updateOrderStatus);

export default router;
