import mongoose from 'mongoose';
import { OrderStatus } from '../constants/orderStatus';

const orderSchema = new mongoose.Schema({
  orderId: { type: 'string', required: true },
  userId: { type: 'string', required: true },
  products: {
    type: ['string'],
    required: true
  },
  amount: { type: 'number', required: true },
  status: {
    type: 'string',
    enum: [OrderStatus.PENDING, 'Delivered', 'Shipped'],
    default: OrderStatus.PENDING
  },
  shippingAddress: { type: 'string', required: false },
  paymentStatus: { type: 'string', required: true },
  paymentId: { type: 'string' },
  expectedDeliveryDate: { type: 'string', required: true },
  orderPlacedDate: { type: 'string', required: true },
  image: { type: 'string', required: true },
  deliveryBoy: { type: 'string', required: false }
});

export default mongoose.model('order', orderSchema);
