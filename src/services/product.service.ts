import productSchema from '../models/product.model';
import { ApiError } from '../utils/apiError';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import userSchema from '../models/user.model';
import AddressEntity from '../models/address.model';
import { ProductStatus } from '../constants/productStatus';
import { Roles } from '../constants/roles';
import { v2 as cloudinary } from 'cloudinary';
import { upload } from '../utils/multer';
import https from 'https';
import { addressSchema } from '../validators/address.validator';

async function uploadImage(filePath: string, productId: string, imageName: string) {
  try {
    // Only disable SSL verification in development
    const isDevelopment = process.env.NODE_ENV !== 'production';

    let uploadOptions: any = {
      folder: productId, // folder will be "productId"
      public_id: imageName, // name of the file
      resource_type: 'image' as const,
      overwrite: true, // overwrite if exists
      timeout: 60000
    };

    // Only add SSL bypass in development
    if (isDevelopment) {
      const agent = new https.Agent({
        rejectUnauthorized: false
      });
      uploadOptions.agent = agent;
    }

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    console.log('Uploaded:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

const saveProduct = async (
  name: string,
  description: string,
  originalPrice: number,
  currentPrice: number,
  category: string,
  userId: string,
  ageGroup: string,
  condition: string,
  sellType: 'Sell with us' | 'Sell to us',
  itemUrl: string,
  pickupAddress: string,
  files: Express.Multer.File[]
) => {
  if (!files || files.length === 0) {
    throw new ApiError('At least one image is required', 400);
  }

  const productId = uuidv4();

  // verifying address for pickup
  const validateAddress = await AddressEntity.findById(pickupAddress);
  if (!validateAddress) {
    throw new ApiError('Invalid pickup address', 400);
  }

  const imageFolderPath = path.join(process.cwd(), 'uploads', productId);

  if (!fs.existsSync(imageFolderPath)) {
    fs.mkdirSync(imageFolderPath, { recursive: true });
  }
  const images = await Promise.all(
    files.map(async (file, index) => {
      const ext = path.extname(file.originalname);
      const filename = `image-${index + 1}${ext}`;
      const filePath = path.join(imageFolderPath, filename);

      fs.writeFileSync(filePath, file.buffer);

      const imageURL = await uploadImage(filePath, productId, filename);
      return {
        filename,
        url: imageURL
      };
    })
  );

  // const images = files.map(async (file, index) => {
  //   const ext = path.extname(file.originalname);
  //   const filename = `image-${index + 1}${ext}`;
  //   const filePath = path.join(imageFolderPath, filename); // local file path

  //   fs.writeFileSync(filePath, file.buffer);

  //   const imageURL = await uploadImage(filePath, productId, filename);
  //   return {
  //     filename,
  //     url: imageURL
  //   };

  //   // const ext = path.extname(file.originalname);
  //   // const filename = `image-${index + 1}${ext}`;
  //   // const filePath = path.join(imageFolderPath, filename);

  //   // return {
  //   //   filename,
  //   //   url: `/uploads/${productId}/${filename}`
  //   // };
  // });
  const product = {
    name,
    description,
    userId,
    originalPrice,
    currentPrice,
    category,
    ageGroup,
    condition,
    sellType,
    itemUrl,
    pickupAddress,
    images
  };
  const result = await productSchema.create(product);

  return result;
};

const getProductDetails = async (productId: string) => {
  const product = await productSchema.findById(productId);

  if (!product) {
    throw new ApiError(`No such product with id: ${productId}`, 400);
  }

  return product;
};

const getAllProducts = async (queryParams?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  condition?: string;
  ageGroup?: string;
  minPrice?: number;
  maxPrice?: number;
  sellType?: 'Sell with us' | 'Sell to us';
  sortBy?: string;
  status?: string;
}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      condition,
      ageGroup,
      minPrice,
      maxPrice,
      sellType,
      sortBy,
      status
    } = queryParams || {};

    const filter: any = {};

    // Status filter
    if (status) filter.status = status;

    // Category
    if (category) filter.category = category;

    // Condition
    if (condition) filter.condition = condition;

    // Age group
    if (ageGroup) filter.ageGroup = ageGroup;

    // Sell type
    if (sellType) filter.sellType = sellType;

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.currentPrice = {};
      if (minPrice !== undefined) filter.currentPrice.$gte = minPrice;
      if (maxPrice !== undefined) filter.currentPrice.$lte = maxPrice;
    }

    // Search
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ name: regex }, { description: regex }, { category: regex }];
    }

    // --------------------------
    // SORTING
    // --------------------------
    let sort: any = {};

    switch (sortBy) {
      case 'price-low-to-high':
        sort.currentPrice = 1;
        break;

      case 'price-high-to-low':
        sort.currentPrice = -1;
        break;

      case 'name-a-to-z':
        sort.name = 1;
        break;

      case 'name-z-to-a':
        sort.name = -1;
        break;

      case 'oldest':
        sort.createdAt = 1;
        break;

      case 'newest':
      default:
        sort.createdAt = -1;
        break;
    }

    // --------------------------
    // PAGINATION
    // --------------------------
    const skip = (page - 1) * limit;

    // --------------------------
    // FINAL QUERY
    // --------------------------
    const products = await productSchema.find(filter).sort(sort).skip(skip).limit(limit);

    return products;
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw new ApiError('Some error occurred while getting products', 500);
  }
};

const getAllUnapprovedProducts = async () => {
  const products = await productSchema.find({ status: { $ne: 'Completed' } });
  if (products) {
    return products;
  } else {
    throw new ApiError('Some error occurred while getting unapproved products', 500);
  }
};

const updateProductStatus = async (
  productId: string,
  role: string,
  status:
    | ProductStatus.READY_TO_PICK
    | ProductStatus.PICKED
    | ProductStatus.COMPLETED
    | ProductStatus.REJECTED,
  price?: number,
  pickupGuy?: string
) => {
  const product = await productSchema.findById(productId);

  if (!product) {
    throw new ApiError(`No such product with id: ${productId}`, 400);
  }

  let updatedProduct;

  if (status === ProductStatus.READY_TO_PICK) {
    if (role !== Roles.ADMIN) {
      throw new ApiError('Only Admin can update product status to Ready to pick', 403);
    }
    if (pickupGuy) {
      // getting pickup guy by comparing role
      const validatePickupGuy = await userSchema.findOne({
        userId: pickupGuy,
        userType: Roles.DELIVERY_BOY
      });

      if (validatePickupGuy) {
        updatedProduct = await productSchema.findByIdAndUpdate(
          productId,
          { $set: { status: status, pickupGuy: pickupGuy } },
          { new: true }
        );
      } else {
        throw new ApiError('Invalid pickup boy', 400);
      }
    } else {
      throw new ApiError('Price and Pickup guy are must for updating status to Ready to pick', 400);
    }
  } else if (status === ProductStatus.PICKED) {
    if (role !== Roles.ADMIN && role !== Roles.DELIVERY_BOY) {
      throw new ApiError('Only DeliveryBoy can update product status to Picked', 403);
    }
    updatedProduct = await productSchema.findByIdAndUpdate(
      productId,
      { $set: { status: status } },
      { new: true }
    );
  } else if (status === ProductStatus.COMPLETED) {
    if (role !== Roles.ADMIN && role !== Roles.DELIVERY_BOY) {
      throw new ApiError('Only DeliveryBoy or Admin can update product status to Completed', 403);
    }
    updatedProduct = await productSchema.findByIdAndUpdate(
      productId,
      { $set: { status: status } },
      { new: true }
    );
  } else if (status === ProductStatus.REJECTED) {
    if (role !== Roles.ADMIN) {
      throw new ApiError('Only Admin can update product status to Rejected', 403);
    }
    updatedProduct = await productSchema.findByIdAndUpdate(
      productId,
      { $set: { status: status } },
      { new: true }
    );
  }

  return updatedProduct;
};

export {
  getProductDetails,
  saveProduct,
  getAllProducts,
  updateProductStatus,
  getAllUnapprovedProducts
};
