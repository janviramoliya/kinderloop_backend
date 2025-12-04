import { z } from 'zod';

export const cartSchema = z.object({
  productId: z.string()
});
