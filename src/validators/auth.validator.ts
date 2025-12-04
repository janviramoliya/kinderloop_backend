// src/validators/auth.validator.ts
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string(),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  userType: z.enum(['Customer', 'Seller', 'Admin', 'DeliveryBoy'], {
    message: 'Invalid user type'
  })
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' })
});
