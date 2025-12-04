import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productId: { type: 'string', required: true },
  userId: { type: 'string', required: true },
  name: { type: 'string', required: true },
  description: { type: 'string', required: false },
  originalPrice: { type: 'number', required: true },
  currentPrice: { type: 'number', required: true },
  category: { type: 'string', required: true },
  ageGroup: { type: 'string', required: false },
  condition: { type: 'string', required: true },
  sellType: { type: 'string', required: true },
  status: { type: 'string', default: 'Pending' },
  available: { type: 'boolean', default: true },
  itemUrl: { type: 'string', required: false },
  pickupGuy: { type: 'string', required: false },
  pickupAddress: { type: 'string', required: true },
  images: [
    {
      filename: { type: 'string' },
      url: { type: 'string' }
    }
  ]
});

export default mongoose.model('product', productSchema);
