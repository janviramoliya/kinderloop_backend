import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, trim: true, required: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      required: true,
      enum: {
        values: ['Customer', 'Seller', 'Admin', 'DeliveryBoy'],
        message: 'Usertype is required'
      }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('user', userSchema);
