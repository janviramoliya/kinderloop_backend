import addressSchema from '../models/address.model';
import { AddressModel } from '../types/address';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../utils/apiError';

interface addressEntry extends AddressModel {
  gsi1pk?: string;
  gsi1sk?: string;
}

const saveAddress = async (addressData: addressEntry) => {
  const { userId } = addressData;

  // const addressId = uuidv4();
  // addressData.addressId = addressId;
  addressData.gsi1pk = userId;
  addressData.gsi1sk = new Date().toISOString();

  const newAddress = await addressSchema.create(addressData);

  return newAddress;
};

const getAddressByUser = async (userId: string) => {
  const addresses = await addressSchema.find({ userId: userId });
  return addresses;
};

const getAddressById = async (addressId: string) => {
  const address = await addressSchema.findById(addressId);
  if (!address) {
    throw new ApiError('Address not found with id: ' + addressId, 400);
  }
  return address;
};

const updateAddressById = async (addressId: string, addressData: Partial<AddressModel>) => {
  const existingAddress = await addressSchema.findById(addressId);

  if (existingAddress) {
    const updatedAddress = await existingAddress.updateOne(addressData);
    return updatedAddress;
  } else {
    return null;
  }
};

const deleteAddressById = async (addressId: string, userId?: string) => {
  if (!userId) {
    throw new ApiError('Login is required to delete address', 400);
  }

  const existingAddress = await addressSchema.findById(addressId);
  if (!existingAddress) {
    throw new ApiError('Address not found with id: ' + addressId, 400);
  }

  const deletedAddress = await existingAddress.deleteOne();

  return deletedAddress;
};

export { saveAddress, getAddressByUser, getAddressById, updateAddressById, deleteAddressById };
