// src/validators/product.validator.ts
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string(),
  description: z.string(),
  originalPrice: z.coerce.number(),
  currentPrice: z.coerce.number(),
  category: z.string(),
  ageGroup: z.string().optional(),
  condition: z.string().optional(),
  sellType: z.enum(['Sell to us', 'Sell with us']),
  pickupAddress: z.string(),
  pickupGuy: z.string().optional(),
  itemUrl: z.string().optional()
});
