import { z } from 'zod';

// Validator for product query parameters
export const productQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(), // Max 100 items per page
    search: z.string().trim().min(1).optional().or(z.literal('')),
    category: z.string().optional(),
    condition: z.string().optional(),
    ageGroup: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    sellType: z.string().optional(),
    sortBy: z.string().optional(),
    status: z.string().optional(),
    q: z.string().optional() // For search endpoint
  })
  .refine(
    (data) => {
      // Ensure minPrice is not greater than maxPrice
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: 'minPrice must be less than or equal to maxPrice',
      path: ['minPrice']
    }
  );

export type ProductQueryParams = z.infer<typeof productQuerySchema>;
