import userSchema from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { v4 as uuidv4 } from 'uuid';

const registerUser = async (name: string, email: string, password: string, userType: string) => {
  // Check if user already exists
  const userExisting = await userSchema.findOne({ email });

  if (userExisting) throw new ApiError('Email already registered', 400);

  // const userId = uuidv4();
  const hashed = await hashPassword(password);
  const createdUser = await userSchema.create({
    name,
    email,
    password: hashed,
    userType: userType
  });
  const userId = createdUser._id;

  const payload = { userId, email, role: userType };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const user = { userId, name, email };

  return { user, tokens: { accessToken, refreshToken } };
};

const loginUser = async (email: string, password: string) => {
  // Find user by email
  const user = await userSchema.findOne({ email });

  if (!user) throw new ApiError('Invalid credentials', 401);

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new ApiError('Invalid credentials', 401);

  const payload = { userId: user._id, email: user.email, role: user.userType };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { user, tokens: { accessToken, refreshToken } };
};

const changeUserPassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await userSchema.findOne({ userId });

  if (!user) throw new ApiError('User not found', 404);

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) throw new ApiError('Current password is incorrect', 400);

  const hashedNewPassword = await hashPassword(newPassword);
  await userSchema.findOneAndUpdate({ password: hashedNewPassword }).where({ userId });
  return { message: 'Password changed successfully' };
};

const getUsers = async (role: string) => {
  if (role) {
    return await userSchema.find({}).where({ userType: role });
  } else {
    return await userSchema.find();
  }
};

export { registerUser, loginUser, changeUserPassword, getUsers };
