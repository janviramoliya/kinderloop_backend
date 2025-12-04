import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { OrderModel, OrderStatusModel } from '../types/order';
import { ApiError } from '../utils/apiError';
import {
  getOrders,
  saveOrder,
  updateDeliveryStatus,
  getAllOrdersForAdmin,
  getOrderById,
  getAdminOrderDetails
} from '../services/order.service';
import { Roles } from '../constants/roles';

const placeOrder = catchAsync(async (req: Request<{}, {}, OrderModel>, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError('Login is compulsory for placing order', 400);
  }
  const { products, shippingAddress, paymentStatus, paymentId } = req.body;

  const result = await saveOrder(userId, products, shippingAddress, paymentStatus, paymentId);

  res.status(201).json(result);
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const role = req.user?.role || Roles.CUSTOMER;

  if (!userId) {
    throw new ApiError('Login is compulsory for getting orders', 400);
  }

  const result = await getOrders(userId, role);

  res.status(200).json(result);
});

const updateOrderStatus = catchAsync(
  async (req: Request<{ id: string }, {}, OrderStatusModel>, res: Response) => {
    const orderId = req.params.id;
    const status = req.body.status;
    const deliveryBoy = req.body.deliveryBoy;

    const result = await updateDeliveryStatus(
      orderId,
      status,
      req.user?.role || Roles.CUSTOMER,
      deliveryBoy
    );

    res.status(200).json({ status: 'Order status updated successfully', order: result });
  }
);

const getAllOrdersAdmin = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, search, status, startDate, endDate, sortBy } = req.query;

  // Build query parameters with proper validation
  const queryParams = {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20,
    search: search ? (search as string).trim() : undefined,
    status: status ? (status as string).trim() : undefined,
    startDate: startDate ? (startDate as string) : undefined,
    endDate: endDate ? (endDate as string) : undefined,
    sortBy: sortBy ? (sortBy as string).trim() : 'newest'
  };

  const result = await getAllOrdersForAdmin(queryParams);

  res.status(200).json({
    success: true,
    data: result.orders,
    pagination: result.pagination,
    totalAmount: result.totalAmount
  });
});

const getOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await getOrderById(id);
  res.status(200).json(order);
});

const getOrderDetailsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await getAdminOrderDetails(id);
  res.status(200).json(order);
});

export {
  placeOrder,
  getAllOrders,
  updateOrderStatus,
  getAllOrdersAdmin,
  getOrder,
  getOrderDetailsForAdmin
};
