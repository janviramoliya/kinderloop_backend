import contactSchema, {
  ContactStatus,
  ContactPriority,
  ContactCategory
} from '../models/contact.model';
import { ApiError } from '../utils/apiError';
import { v4 as uuidv4 } from 'uuid';

// Interface for creating a new contact
export interface CreateContactData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category?: ContactCategory;
  source?: 'website' | 'mobile_app' | 'phone' | 'email';
  userAgent?: string;
  ipAddress?: string;
}

// Interface for updating contact status
export interface UpdateContactStatusData {
  status: ContactStatus;
  priority?: ContactPriority;
  assignedTo?: string;
  response?: string;
}

// Interface for contact response
export interface RespondToContactData {
  response: string;
  status?: ContactStatus;
  respondedBy: string;
}

// Interface for contact filters
export interface ContactFilters {
  status?: ContactStatus;
  priority?: ContactPriority;
  category?: ContactCategory;
  assignedTo?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Create a new contact inquiry
 */
export const createContact = async (contactData: CreateContactData) => {
  // const contactId = uuidv4();

  const contact = {
    // contactId,
    ...contactData,
    category: contactData.category || 'general',
    source: contactData.source || 'website',
    status: 'pending' as ContactStatus,
    priority: 'medium' as ContactPriority,
    isRead: false
  };

  try {
    const result = await contactSchema.create(contact);
    return result;
  } catch (error) {
    console.error('Error creating contact:', error);
    throw new ApiError('Failed to create contact inquiry', 500);
  }
};

/**
 * Get all contacts with optional filters (Admin only)
 */
export const getAllContacts = async (filters: ContactFilters = {}) => {
  try {
    const {
      status,
      priority,
      category,
      assignedTo,
      page = 1,
      limit = 10,
      startDate,
      endDate
    } = filters;

    const query: any = {};

    // Use different GSI based on filter
    if (status) {
      query.status = status;
    }
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    if (category) {
      query.category = category;
    }
    if (priority) {
      query.priority = priority;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // pagination calculations
    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      contactSchema.find(query).sort({ created: -1 }).skip(skip).limit(limit),
      contactSchema.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      contacts,
      pagination: {
        current: page,
        total: totalPages,
        count: contacts.length,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    console.error('Error getting contacts:', error);
    throw new ApiError('Failed to retrieve contacts', 500);
  }
};

/**
 * Get a specific contact by ID
 */
export const getContactById = async (contactId: string) => {
  try {
    const result = await contactSchema.findById(contactId);

    if (!result) {
      throw new ApiError('Contact not found', 404);
    }

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error getting contact by ID:', error);
    throw new ApiError('Failed to retrieve contact', 500);
  }
};

/**
 * Update contact status (Admin only)
 */
export const updateContactStatus = async (
  contactId: string,
  updateData: UpdateContactStatusData,
  updatedBy: string
) => {
  try {
    const existingContact = await getContactById(contactId);

    const updateFields: any = {
      status: updateData.status,
      updatedAt: new Date().toISOString()
    };

    if (updateData.priority) {
      updateFields.priority = updateData.priority;
    }

    if (updateData.assignedTo) {
      updateFields.assignedTo = updateData.assignedTo;
    }

    if (updateData.response) {
      updateFields.response = updateData.response;
      updateFields.respondedAt = new Date().toISOString();
      updateFields.respondedBy = updatedBy;
    }

    const result = await contactSchema.findByIdAndUpdate(
      contactId,
      { $set: updateFields },
      { new: true }
    );
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error updating contact status:', error);
    throw new ApiError('Failed to update contact status', 500);
  }
};

/**
 * Respond to a contact inquiry (Admin only)
 */
export const respondToContact = async (contactId: string, responseData: RespondToContactData) => {
  try {
    await getContactById(contactId); // Ensure contact exists

    const updateFields = {
      response: responseData.response,
      status: responseData.status || 'resolved',
      respondedAt: new Date().toISOString(),
      respondedBy: responseData.respondedBy,
      isRead: true,
      updatedAt: new Date().toISOString()
    };

    const result = await contactSchema.findByIdAndUpdate(
      contactId,
      { $set: updateFields },
      { new: true }
    );
    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error responding to contact:', error);
    throw new ApiError('Failed to respond to contact', 500);
  }
};

/**
 * Mark contact as read (Admin only)
 */
export const markContactAsRead = async (contactId: string) => {
  try {
    await getContactById(contactId); // Ensure contact exists

    const result = await contactSchema.findByIdAndUpdate(
      contactId,
      {
        $set: {
          isRead: true
        }
      },
      {
        new: true
      }
    );

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error marking contact as read:', error);
    throw new ApiError('Failed to mark contact as read', 500);
  }
};

/**
 * Delete a contact (Admin only) - Soft delete by updating status
 */
export const deleteContact = async (contactId: string) => {
  try {
    await getContactById(contactId); // Ensure contact exists

    // Soft delete by setting status to closed
    const result = await contactSchema.findByIdAndUpdate(
      contactId,
      {
        $set: {
          status: 'closed'
        }
      },
      { new: true }
    );

    return result;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error deleting contact:', error);
    throw new ApiError('Failed to delete contact', 500);
  }
};

/**
 * Get contact statistics (Admin only)
 */
export const getContactStats = async () => {
  try {
    const contacts = await contactSchema.find({});

    const stats = {
      total: contacts.length,
      pending: contacts.filter((c) => c.status === 'pending').length,
      inProgress: contacts.filter((c) => c.status === 'in_progress').length,
      resolved: contacts.filter((c) => c.status === 'resolved').length,
      closed: contacts.filter((c) => c.status === 'closed').length,
      unread: contacts.filter((c) => !c.isRead).length,
      byCategory: {
        general: contacts.filter((c) => c.category === 'general').length,
        support: contacts.filter((c) => c.category === 'support').length,
        complaint: contacts.filter((c) => c.category === 'complaint').length,
        suggestion: contacts.filter((c) => c.category === 'suggestion').length,
        business: contacts.filter((c) => c.category === 'business').length
      },
      byPriority: {
        low: contacts.filter((c) => c.priority === 'low').length,
        medium: contacts.filter((c) => c.priority === 'medium').length,
        high: contacts.filter((c) => c.priority === 'high').length,
        urgent: contacts.filter((c) => c.priority === 'urgent').length
      }
    };

    return stats;
  } catch (error) {
    console.error('Error getting contact stats:', error);
    throw new ApiError('Failed to retrieve contact statistics', 500);
  }
};

/**
 * Bulk operations on contacts (Admin only)
 */
export const bulkContactOperation = async (
  contactIds: string[],
  action: 'mark_read' | 'change_status' | 'assign' | 'delete',
  data?: { status?: ContactStatus; assignedTo?: string }
) => {
  try {
    const results = [];

    for (const contactId of contactIds) {
      let result;

      switch (action) {
        case 'mark_read':
          result = await markContactAsRead(contactId);
          break;
        case 'change_status':
          if (data?.status) {
            result = await updateContactStatus(contactId, { status: data.status }, 'system');
          }
          break;
        case 'assign':
          if (data?.assignedTo) {
            result = await updateContactStatus(
              contactId,
              {
                status: 'in_progress',
                assignedTo: data.assignedTo
              },
              'system'
            );
          }
          break;
        case 'delete':
          result = await deleteContact(contactId);
          break;
        default:
          throw new ApiError('Invalid bulk operation action', 400);
      }

      if (result) {
        results.push({ contactId, success: true, data: result });
      }
    }

    return {
      processed: results.length,
      results
    };
  } catch (error) {
    console.error('Error in bulk contact operation:', error);
    throw new ApiError('Failed to perform bulk operation', 500);
  }
};
