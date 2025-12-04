import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    wishlistId: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    productId: { type: 'string', required: true }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('wishlist', wishlistSchema);
