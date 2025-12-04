import { z } from 'zod';

// Schema for creating a new contact inquiry
export const createContactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(
      /^[a-zA-Z\s.'-]+$/,
      'Name can only contain letters, spaces, dots, apostrophes, and hyphens'
    ),
  email: z
    .string()
    .email('Please provide a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[0-9+\-\s()]+$/, 'Please provide a valid phone number'),
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters'),
  category: z
    .enum(['general', 'support', 'complaint', 'suggestion', 'business'])
    .optional()
    .default('general'),
  source: z.enum(['website', 'mobile_app', 'phone', 'email']).optional().default('website')
});

// Schema for updating contact status (Admin only)
export const updateContactStatusSchema = z.object({
  params: z.object({
    contactId: z.string().uuid('Invalid contact ID format')
  }),
  body: z.object({
    status: z.enum(['pending', 'in_progress', 'resolved', 'closed']),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assignedTo: z.string().uuid('Invalid user ID format').optional(),
    response: z.string().max(2000, 'Response must be less than 2000 characters').optional()
  })
});

// Schema for responding to a contact inquiry (Admin only)
export const respondToContactSchema = z.object({
  params: z.object({
    contactId: z.string().uuid('Invalid contact ID format')
  }),
  body: z.object({
    response: z
      .string()
      .min(10, 'Response must be at least 10 characters')
      .max(2000, 'Response must be less than 2000 characters'),
    status: z.enum(['in_progress', 'resolved']).optional().default('resolved')
  })
});

// Schema for getting contacts with filters (Admin only)
export const getContactsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['pending', 'in_progress', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    category: z.enum(['general', 'support', 'complaint', 'suggestion', 'business']).optional(),
    assignedTo: z.string().uuid('Invalid user ID format').optional(),
    page: z.coerce.number().min(1, 'Page must be at least 1').optional().default(1),
    limit: z.coerce
      .number()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .optional()
      .default(10),
    search: z.string().max(100, 'Search term must be less than 100 characters').optional(),
    startDate: z.string().datetime('Invalid start date format').optional(),
    endDate: z.string().datetime('Invalid end date format').optional()
  })
});

// Schema for marking contact as read (Admin only)
export const markContactAsReadSchema = z.object({
  params: z.object({
    contactId: z.string().uuid('Invalid contact ID format')
  })
});

// Schema for bulk operations (Admin only)
export const bulkContactOperationSchema = z.object({
  body: z.object({
    contactIds: z
      .array(z.string().uuid('Invalid contact ID format'))
      .min(1, 'At least one contact ID is required')
      .max(50, 'Cannot process more than 50 contacts at once'),
    action: z.enum(['mark_read', 'change_status', 'assign', 'delete']),
    data: z
      .object({
        status: z.enum(['pending', 'in_progress', 'resolved', 'closed']).optional(),
        assignedTo: z.string().uuid('Invalid user ID format').optional()
      })
      .optional()
  })
});

// Types for TypeScript
export type CreateContactRequest = z.infer<typeof createContactSchema>;
export type UpdateContactStatusRequest = z.infer<typeof updateContactStatusSchema>;
export type RespondToContactRequest = z.infer<typeof respondToContactSchema>;
export type GetContactsQueryRequest = z.infer<typeof getContactsQuerySchema>;
export type MarkContactAsReadRequest = z.infer<typeof markContactAsReadSchema>;
export type BulkContactOperationRequest = z.infer<typeof bulkContactOperationSchema>;
