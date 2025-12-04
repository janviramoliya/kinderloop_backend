import { z } from 'zod';

export const orderSchema = z.object({
  products: z.array(z.string()).min(1, 'At least one product is required'),
  shippingAddress: z.string(),
  paymentStatus: z.string(),
  paymentId: z.string().optional()
});

export const orderStatusSchema = z.object({
  status: z.string()
});
