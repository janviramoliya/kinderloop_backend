import { Router } from 'express';
import { validateRequest } from '../middlewares/validate-request.middleware';
import {
  addAddress,
  deleteAddress,
  getAddress,
  getAllAddresses,
  updateAddress
} from '../controllers/address.controller';
import authenticateUser from '../middlewares/authenticateUser';
import { addressSchema } from '../validators/address.validator';

const router = Router();

router.post('/', authenticateUser, validateRequest(addressSchema), addAddress);
router.get('/', authenticateUser, getAllAddresses);
router.get('/:id', authenticateUser, getAddress);
router.put('/:id', authenticateUser, validateRequest(addressSchema), updateAddress);
router.delete('/:id', authenticateUser, deleteAddress);

export default router;
