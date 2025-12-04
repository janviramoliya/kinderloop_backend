import { Router } from 'express';
import {
  register,
  login,
  me,
  logout,
  getAllUsers,
  changePassword,
  updateUser,
  deleteUser,
  getUserById
} from '../controllers/auth.controller';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/auth.validator';
import { validateRequest } from '../middlewares/validate-request.middleware';
import authenticateUser from '../middlewares/authenticateUser';
import authorizePermission from '../middlewares/authorizePermission';
import { Roles } from '../constants/roles';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.patch(
  '/change-password',
  authenticateUser,
  validateRequest(changePasswordSchema),
  changePassword
);
router.post('/logout', logout);
router.get('/me', authenticateUser, me);
router.get('/admin', authenticateUser, authorizePermission(Roles.ADMIN), getAllUsers);
router.get('/:userId', authenticateUser, authorizePermission(Roles.ADMIN), getUserById);
router.patch('/:userId', authenticateUser, authorizePermission(Roles.ADMIN), updateUser);
router.delete('/:userId', authenticateUser, authorizePermission(Roles.ADMIN), deleteUser);

export default router;
