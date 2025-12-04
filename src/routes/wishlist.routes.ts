import { Router } from 'express';
import authenticateUser from '../middlewares/authenticateUser';
import { validateRequest } from '../middlewares/validate-request.middleware';
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlist.controller';
import { wishlistSchema } from '../validators/wishlist.validator';

const router = Router();

router.post('/', authenticateUser, validateRequest(wishlistSchema), addToWishlist);
router.get('/', authenticateUser, getWishlist);
router.delete('/:productId', authenticateUser, removeFromWishlist);

export default router;
