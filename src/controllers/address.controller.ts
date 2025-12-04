import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/apiError';
import { AddressModel } from '../types/address';
import {
  getAddressById,
  getAddressByUser,
  saveAddress,
  updateAddressById,
  deleteAddressById
} from '../services/address.service';

const addAddress = catchAsync(async (req: Request<{}, {}, AddressModel>, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError('Login is compulsory for getting orders', 400);
  }

  req.body.userId = userId;
  const result = await saveAddress(req.body);

  res.status(201).json({ status: 'Address added successfully', address: result });
});

const getAllAddresses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new ApiError('Login is compulsory for getting addresses', 400);
  }

  const addresses = await getAddressByUser(userId);
  res.status(200).json({ status: 'Addresses fetched successfully', addresses });
});

const getAddress = catchAsync(async (req: Request, res: Response) => {
  const addressId = req.params.id;

  const address = await getAddressById(addressId);

  res.status(200).json({ status: 'Address fetched successfully', address: address });
});

const updateAddress = catchAsync(async (req: Request, res: Response) => {
  const addressId = req.params.id;
  const addressData = req.body;

  const updatedAddress = await updateAddressById(addressId, addressData);

  res.status(200).json({ status: 'Address updated successfully', address: updatedAddress });
});

const deleteAddress = catchAsync(async (req: Request, res: Response) => {
  const addressId = req.params.id;
  const userId = req.user?.userId;

  const result = await deleteAddressById(addressId, userId);

  res.status(200).json({ status: 'Address deleted successfully', address: result });
});

export { addAddress, getAddress, getAllAddresses, updateAddress, deleteAddress };
