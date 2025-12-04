// Extend IUser to include Dynamoose's document structure
export interface RegisterModal {
  userId: string;
  name: string;
  email: string;
  password: string;
  userType: 'Customer' | 'Seller' | 'DeliveryBoy' | 'Admin';
  createdAt?: string;
  updatedAt?: string;
}
