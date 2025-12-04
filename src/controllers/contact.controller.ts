import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/apiError';
import contactSchema from '../models/contact.model';
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContactStatus,
  respondToContact,
  markContactAsRead,
  deleteContact,
  getContactStats,
  bulkContactOperation
} from '../services/contact.service';

/**
 * @desc    Create a new contact inquiry
 * @route   POST /api/contact
 * @access  Public
 */
export const createContactInquiry = catchAsync(async (req: Request, res: Response) => {
  const { name, email, phone, subject, message, category, source } = req.body;

  // Extract user agent and IP for tracking
  const userAgent = req.get('User-Agent');
  const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

  const contactData = {
    name,
    email,
    phone,
    subject,
    message,
    category,
    source,
    userAgent,
    ipAddress
  };

  const contact = await createContact(contactData);

  res.status(201).json({
    success: true,
    message: 'Contact inquiry submitted successfully. We will get back to you soon.',
    data: {
      contactId: contact.contactId,
      submittedAt: contact.createdAt
    }
  });
});

/**
 * @desc    Get all contact inquiries with filters
 * @route   GET /api/contact/admin
 * @access  Private/Admin
 */
export const getContactInquiries = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query;

  const result = await getAllContacts(filters);

  res.status(200).json({
    success: true,
    data: result.contacts,
    pagination: result.pagination
  });
});

/**
 * @desc    Get a specific contact inquiry
 * @route   GET /api/contact/admin/:contactId
 * @access  Private/Admin
 */
export const getContactInquiry = catchAsync(async (req: Request, res: Response) => {
  const { contactId } = req.params;

  const contact = await getContactById(contactId);

  res.status(200).json({
    success: true,
    data: contact
  });
});

/**
 * @desc    Update contact inquiry status
 * @route   PATCH /api/contact/admin/:contactId/status
 * @access  Private/Admin
 */
export const updateContactInquiryStatus = catchAsync(async (req: Request, res: Response) => {
  const { contactId } = req.params;
  const { status, priority, assignedTo, response } = req.body;
  const updatedBy = req.user?.userId;

  if (!updatedBy) {
    throw new ApiError('Authentication required', 401);
  }

  const updateData = { status, priority, assignedTo, response };
  const contact = await updateContactStatus(contactId, updateData, updatedBy);

  res.status(200).json({
    success: true,
    message: 'Contact inquiry status updated successfully',
    data: contact
  });
});

/**
 * @desc    Respond to a contact inquiry
 * @route   POST /api/contact/admin/:contactId/respond
 * @access  Private/Admin
 */
export const respondToContactInquiry = catchAsync(async (req: Request, res: Response) => {
  const { contactId } = req.params;
  const { response, status } = req.body;
  const respondedBy = req.user?.userId;

  if (!respondedBy) {
    throw new ApiError('Authentication required', 401);
  }

  const responseData = { response, status, respondedBy };
  const contact = await respondToContact(contactId, responseData);

  res.status(200).json({
    success: true,
    message: 'Response sent successfully',
    data: contact
  });
});

/**
 * @desc    Mark contact inquiry as read
 * @route   PATCH /api/contact/admin/:contactId/read
 * @access  Private/Admin
 */
export const markContactInquiryAsRead = catchAsync(async (req: Request, res: Response) => {
  const { contactId } = req.params;

  const contact = await markContactAsRead(contactId);

  res.status(200).json({
    success: true,
    message: 'Contact inquiry marked as read',
    data: contact
  });
});

/**
 * @desc    Delete (close) a contact inquiry
 * @route   DELETE /api/contact/admin/:contactId
 * @access  Private/Admin
 */
export const deleteContactInquiry = catchAsync(async (req: Request, res: Response) => {
  const { contactId } = req.params;

  await deleteContact(contactId);

  res.status(200).json({
    success: true,
    message: 'Contact inquiry deleted successfully'
  });
});

/**
 * @desc    Get contact statistics
 * @route   GET /api/contact/admin/stats
 * @access  Private/Admin
 */
export const getContactStatistics = catchAsync(async (req: Request, res: Response) => {
  const stats = await getContactStats();

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * @desc    Bulk operations on contact inquiries
 * @route   POST /api/contact/admin/bulk
 * @access  Private/Admin
 */
export const bulkContactOperations = catchAsync(async (req: Request, res: Response) => {
  const { contactIds, action, data } = req.body;

  const result = await bulkContactOperation(contactIds, action, data);

  res.status(200).json({
    success: true,
    message: `Bulk operation '${action}' completed successfully`,
    data: result
  });
});

/**
 * @desc    Get contact inquiries by email (for customer to check their submissions)
 * @route   GET /api/contact/my-inquiries/:email
 * @access  Public (with rate limiting)
 */
export const getMyContactInquiries = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.params;

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError('Invalid email format', 400);
  }

  try {
    const result = await contactSchema.find({ email });

    // Only return limited information for privacy
    const inquiries = result.map((contact: any) => ({
      contactId: contact.contactId,
      subject: contact.subject,
      status: contact.status,
      createdAt: contact.createdAt,
      respondedAt: contact.respondedAt,
      response: contact.response
    }));

    res.status(200).json({
      success: true,
      data: inquiries
    });
  } catch (error) {
    console.error('Error getting inquiries by email:', error);
    throw new ApiError('Failed to retrieve inquiries', 500);
  }
});
