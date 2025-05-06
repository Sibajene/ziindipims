import { Role } from '@prisma/client';

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  branchId?: string;
  pharmacyId?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
  theme?: string;
  notifications?: any[]; // Replace with proper Notification type if needed
}