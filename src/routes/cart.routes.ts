import { Router } from 'express';
import { validateRequest } from '../middlewares/validate-request.middleware';
import authenticateUser from '../middlewares/authenticateUser';
import { addProductToCart, getCartItems, removeItemFromCart } from '../controllers/cart.controller';
import { cartSchema } from '../validators/cart.validator';

const router = Router();

router.post('/', authenticateUser, validateRequest(cartSchema), addProductToCart);
router.get('/', authenticateUser, getCartItems);
router.delete('/', authenticateUser, removeItemFromCart);

export default router;
