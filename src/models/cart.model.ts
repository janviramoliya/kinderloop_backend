import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  // cartId: { type: 'string', required: true },
  userId: { type: 'string', required: true },
  productId: { type: 'string', required: true }
});

export default mongoose.model('cart', cartSchema);
