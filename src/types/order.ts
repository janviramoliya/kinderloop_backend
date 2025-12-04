export interface OrderModel {
  orderId: string;
  userId: string;
  products: string[];
  amount: number;
  status: 'pending' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentStatus: 'Pending' | 'Completed';
  paymentId: string;
  expectedDeliveryDate: Date;
  orderPlacedDate: Date;
}

export interface OrderStatusModel {
  orderId: string;
  status: 'Shipped' | 'Delivered' | 'Failed';
  deliveryBoy?: string;
  updatedAt: Date;
}
