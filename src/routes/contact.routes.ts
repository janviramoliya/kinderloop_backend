import { Router } from 'express';
import { validateRequest } from '../middlewares/validate-request.middleware';
import authenticateUser from '../middlewares/authenticateUser';
import authorizePermission from '../middlewares/authorizePermission';
import { Roles } from '../constants/roles';
import {
  createContactSchema,
  updateContactStatusSchema,
  respondToContactSchema,
  getContactsQuerySchema,
  markContactAsReadSchema,
  bulkContactOperationSchema
} from '../validators/contact.validator';
import {
  createContactInquiry,
  getContactInquiries,
  getContactInquiry,
  updateContactInquiryStatus,
  respondToContactInquiry,
  markContactInquiryAsRead,
  deleteContactInquiry,
  getContactStatistics,
  bulkContactOperations,
  getMyContactInquiries
} from '../controllers/contact.controller';

const router = Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   POST /api/contact
 * @desc    Submit a new contact inquiry
 * @access  Public
 */
router.post('/', validateRequest(createContactSchema), createContactInquiry);

/**
 * @route   GET /api/contact/my-inquiries/:email
 * @desc    Get contact inquiries by email
 * @access  Public (with rate limiting - implement in middleware)
 */
router.get('/my-inquiries/:email', getMyContactInquiries);

// ==================== ADMIN ROUTES ====================

/**
 * @route   GET /api/contact/admin/stats
 * @desc    Get contact statistics
 * @access  Private/Admin
 */
router.get(
  '/admin/stats',
  authenticateUser,
  authorizePermission(Roles.ADMIN),
  getContactStatistics
);

/**
 * @route   GET /api/contact/admin
 * @desc    Get all contact inquiries with filters
 * @access  Private/Admin
 */
router.get(
  '/admin',
  authenticateUser,
  authorizePermission(Roles.ADMIN),
  validateRequest(getContactsQuerySchema),
  getContactInquiries
);

/**
 * @route   POST /api/contact/admin/bulk
 * @desc    Perform bulk operations on contact inquiries
 * @access  Private/Admin
 */
router.post(
  '/admin/bulk',
  authenticateUser,
  authorizePermission(Roles.ADMIN),
  validateRequest(bulkContactOperationSchema),
  bulkContactOperations
);

/**
 * @route   GET /api/contact/admin/:contactId
 * @desc    Get a specific contact inquiry
 * @access  Private/Admin
 */
router.get(
  '/admin/:contactId',
  authenticateUser,
  authorizePermission(Roles.ADMIN),
  getContactInquiry
);

/**
 * @route   PATCH /api/contact/admin/:contactId/status
 * @desc    Update contact inquiry status
 * @access  Private/Admin
 */
router.patch(
  '/admin/:contactId/status',
  authenticateUser,
  authorizePermission(Roles.ADMIN),
  validateRequest(updateContactStatusSchema),
  updateContactInquiryStatus
);

/**
 * @route   POST /api/contact/admin/:contactId/respond
 * @desc    Respond to a contact inquiry
 * @access  Private/Admin
 */
router.post(
  '/admin/:contactId/respond',
  authenticateUser,
  authorizePermission(Roles.ADMIN),
  validateRequest(respondToContactSchema),
  respondToContactInquiry
);

/**
 * @route   PATCH /api/contact/admin/:contactId/read
 * @desc    Mark contact inquiry as read
 * @access  Private/Admin
 */
router.patch(
  '/admin/:contactId/read',
  authenticateUser,
  authorizePermission(Roles.ADMIN),
  validateRequest(markContactAsReadSchema),
  markContactInquiryAsRead
);

/**
 * @route   DELETE /api/contact/admin/:contactId
 * @desc    Delete (close) a contact inquiry
 * @access  Private/Admin
 */
router.delete(
  '/admin/:contactId',
  authenticateUser,
  authorizePermission(Roles.ADMIN),
  deleteContactInquiry
);

export default router;
