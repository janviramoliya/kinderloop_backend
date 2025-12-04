import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    addressId: { type: 'string', required: true },
    userId: { type: 'string', required: true },
    fullName: { type: 'string', required: true },
    phoneNumber: { type: 'string', required: true },
    addressLine1: { type: 'string', required: true },
    addressLine2: { type: 'string', required: false },
    city: { type: 'string', required: true },
    state: { type: 'string', required: true },
    pinCode: { type: 'string', required: true }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('address', addressSchema);
