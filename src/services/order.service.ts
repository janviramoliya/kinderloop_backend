import { log } from 'console';
import { Roles } from '../constants/roles';
import cartSchema from '../models/cart.model';
import orderSchema from '../models/order.model';
import productSchema from '../models/product.model';
import userSchema from '../models/user.model';
import { ApiError } from '../utils/apiError';
import { v4 as uuidv4 } from 'uuid';
import addressSchema from '../models/address.model';

const saveOrder = async (
  userid: string,
  products: string[],
  shippingAddress: string,
  paymentStatus: string,
  paymentId: string
) => {
  const results = await Promise.all(
    products.map(async (productId) => {
      const product = await productSchema.findById(productId);
      if (!product) {
        throw new ApiError('Order failed due to invalid product id: ' + productId, 404);
      }
      return product;
    })
  );

  let image = '';
  let amount = 0;

  for (const data of results) {
    if (!image) {
      image =
        (data.images as { filename?: string; url?: string }[] | undefined)?.[0]?.url ??
        'defaultImage.png';
    }
    amount += data.currentPrice;
  }

  // const orderId = uuidv4();

  // getting date after 5 days from current date
  const expectedDeliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }
  );

  const orderPlacedDate = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  }).format(new Date());

  const order = {
    // orderId,
    userId: userid,
    products,
    amount,
    shippingAddress,
    paymentStatus,
    paymentId,
    expectedDeliveryDate,
    orderPlacedDate,
    image,
    gsi1pk: userid,
    gsi1sk: new Date().toISOString()
  };

  const result = await orderSchema.create(order);

  // Updating product status as sold out
  for (const id of products) {
    await productSchema.findByIdAndUpdate(id, { $set: { status: 'Sold out' } }, { new: true });

    // Find cart item by userId & productId
    const cartItem = await cartSchema.findOne({ productId: id, userId: userid });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    // Delete using the cartId from the found item
    await cartItem.deleteOne();
  }
  return result;
};

const getOrders = async (userId: string, role: string) => {
  let orders;

  if (role === Roles.ADMIN) {
    orders = await orderSchema.find({});
  } else if (role === Roles.CUSTOMER) {
    orders = await orderSchema.find({ userId: userId });
  }

  let order = orders || [];

  orders = await Promise.all(
    order.map(async (order) => {
      // getting products with it's product name
      // Get product names
      const productsData = await Promise.all(
        order.products.map(async (productId: string) => {
          const product = await productSchema.findById(productId);
          return product?.name || null;
        })
      );
      order.productName = productsData;
      return order;
    })
  );
  if (orders) {
    return orders;
  } else {
    throw new ApiError('No orders found for the user: ' + userId, 404);
  }
};

const updateDeliveryStatus = async (
  orderId: string,
  status: 'Shipped' | 'Delivered' | 'Failed',
  userType: string,
  deliveryBoy?: string
) => {
  const order = await orderSchema.findById(orderId);
  if (!order) {
    throw new ApiError('Order not found with id: ' + orderId, 400);
  }

  if (order.status === 'Delivered') {
    throw new ApiError('Order already delivered', 400);
  }

  if (status === 'Shipped') {
    if (userType !== Roles.ADMIN)
      throw new ApiError('Login as a admin to update order status as shipped', 403);

    if (order.status !== 'Pending') {
      throw new ApiError('Order must be pending before it can be shipped', 400);
    }

    if (!deliveryBoy) {
      throw new ApiError('Delivery boy is required to update order status as shipped', 400);
    }

    // validate delivery partner
    const deliveryPartner = await userSchema.findOne({ userId: deliveryBoy });
    if (!deliveryPartner || deliveryPartner.userType !== Roles.DELIVERY_BOY) {
      throw new ApiError('Invalid delivery partner', 400);
    }
  }

  if (status === 'Delivered' || status === 'Failed') {
    if (userType !== Roles.ADMIN && userType !== Roles.DELIVERY_BOY)
      throw new ApiError('Login as a delivery boy to update order status as delivered', 403);

    if (order.status !== 'Shipped')
      throw new ApiError('Order must be shipped before it can be delivered', 400);
  }

  const updatedOrder = await order.updateOne({ status: status, deliveryBoy: deliveryBoy });

  return updatedOrder;
};

interface AdminOrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
}

const getAllOrdersForAdmin = async (filters: AdminOrderFilters = {}) => {
  try {
    const { page = 1, limit = 20, search, status, startDate, endDate, sortBy = 'newest' } = filters;

    // Get all orders from database
    const allOrdersResult = await orderSchema.find({});
    let orders = allOrdersResult || [];

    orders = await Promise.all(
      orders.map(async (order) => {
        const user = await userSchema.findOne({ userId: order.userId });

        // getting products with it's product name
        // Get product names
        const productsData = await Promise.all(
          order.products.map(async (productId: string) => {
            const product = await productSchema.findById(productId);
            return product?.name || null;
          })
        );
        order.productName = productsData.filter(Boolean); // Remove nulls

        order.username = user?.email;
        return order;
      })
    );

    // Apply filters
    if (status) {
      orders = orders.filter((order) => order.status === status);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      orders = orders.filter(
        (order) =>
          order.orderId.toLowerCase().includes(searchTerm) ||
          order.userId.toLowerCase().includes(searchTerm) ||
          order.paymentId?.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filter
    if (startDate || endDate) {
      orders = orders.filter((order) => {
        const orderDate = new Date(order.orderPlacedDate);
        const start = startDate ? new Date(startDate) : new Date('1970-01-01');
        const end = endDate ? new Date(endDate) : new Date();
        return orderDate >= start && orderDate <= end;
      });
    }

    // Sorting
    orders.sort((a, b) => {
      const aDate = new Date(a.orderPlacedDate).getTime();
      const bDate = new Date(b.orderPlacedDate).getTime();

      switch (sortBy) {
        case 'oldest':
          return aDate - bDate;
        case 'amount-high-to-low':
          return b.amount - a.amount;
        case 'amount-low-to-high':
          return a.amount - b.amount;
        case 'newest':
        default:
          return bDate - aDate;
      }
    });

    // Calculate total amount for filtered orders
    const totalAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

    // Pagination
    const total = orders.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = orders.slice(startIndex, endIndex);

    return {
      orders: paginatedOrders,
      pagination: {
        current: page,
        total: totalPages,
        count: paginatedOrders.length,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      totalAmount
    };
  } catch (error) {
    console.error('Error in getAllOrdersForAdmin:', error);
    throw new ApiError('Failed to retrieve orders for admin', 500);
  }
};

const getOrderById = async (orderId: string) => {
  const order = await orderSchema.findById(orderId);
  return order;
};

const getAdminOrderDetails = async (orderId: string) => {
  const order = await orderSchema.findById(orderId);

  if (!order) {
    throw new ApiError(`Order not found with the id: ${orderId}`, 400);
  }

  const products = await Promise.all(
    order.products.map(async (productId: string) => {
      const product = await productSchema.findById(productId);
      return product;
    })
  );
  const user = await userSchema.findOne({ userId: order.userId });
  const address = await addressSchema.findById(order.shippingAddress);

  order.username = user?.email;
  order.address = address;
  order.productsDetail = products;
  return order;
};

export {
  saveOrder,
  getOrderById,
  getOrders,
  updateDeliveryStatus,
  getAllOrdersForAdmin,
  getAdminOrderDetails
};
