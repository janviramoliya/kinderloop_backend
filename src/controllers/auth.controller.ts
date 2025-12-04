import express, { Request, Response, NextFunction } from 'express';

import { registerUser, loginUser, changeUserPassword, getUsers } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiError } from '../utils/apiError';
import { RegisterModal } from '../types/user';
import userSchema from '../models/user.model';

const attachCookiesToResponse = (res: Response, accessToken: string, refreshToken: string) => {
  // one day for token expiry
  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production',
    signed: true
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay * 7),
    secure: process.env.NODE_ENV === 'production',
    signed: true
  });
};

const register = catchAsync(async (req: Request<{}, {}, RegisterModal>, res: Response) => {
  const { name, email, password, userType } = req.body;

  const { user, tokens } = await registerUser(name, email, password, userType);

  attachCookiesToResponse(res, tokens.accessToken, tokens.refreshToken);
  res.status(201).json({ status: 'success', user });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, tokens } = await loginUser(email, password);

  attachCookiesToResponse(res, tokens.accessToken, tokens.refreshToken);
  res.status(200).json({ status: 'success', user });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: process.env.NODE_ENV === 'production',
    signed: true
  });

  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(Date.now()),
    secure: process.env.NODE_ENV === 'production',
    signed: true
  });

  res.status(200).json({ status: 'success', message: 'User logged out successfully' });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new ApiError('Login is compulsory for changing password', 400);
  }
  const { currentPassword, newPassword } = req.body;

  const result = await changeUserPassword(userId, currentPassword, newPassword);

  res.status(200).json({ status: 'success', message: result.message });
});

const me = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new ApiError('Not authenticated', 401);
    res.status(200).json({ status: 'success', user: req.user });
  } catch (err) {
    next(err);
  }
};

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const { userType } = req.query;
  const users = await getUsers(userType as string);
  res.status(200).json({ status: 'success', data: users });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const updateData = req.body;

  if (!userId) {
    throw new ApiError('User ID is required', 400);
  }

  // Get the user first to check if it exists
  const existingUser = await userSchema.findOne({ userId });
  if (!existingUser) {
    throw new ApiError('User not found', 404);
  }

  // Update the user
  const updatedUser = await userSchema.updateOne({ updateData }).where({ userId });

  res.status(200).json({
    status: 'success',
    data: updatedUser
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError('User ID is required', 400);
  }

  // Check if user exists
  const existingUser = await userSchema.findOne({ userId });
  if (!existingUser) {
    throw new ApiError('User not found', 404);
  }

  // Delete the user
  await existingUser.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully'
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError('User ID is required', 400);
  }

  const user = await userSchema.findOne({ userId });
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  res.status(200).json({
    status: 'success',
    data: userWithoutPassword
  });
});

export {
  changePassword,
  me,
  register,
  login,
  logout,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserById
};
