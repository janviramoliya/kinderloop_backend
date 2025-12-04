// src/validators/product.validator.ts
import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string(),
  phoneNumber: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  pinCode: z.string()
});
