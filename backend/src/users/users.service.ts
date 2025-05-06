import { Injectable, NotFoundException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma, Role } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Add this type at the top of your file
type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role: Role, pharmacyId?: string): Promise<UserWithoutPassword[]> {
    let whereClause = {};
    if (role === Role.OWNER && pharmacyId) {
      whereClause = { pharmacyId };
    }
    const users = await this.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        pharmacyId: true,
        role: true,
        branchId: true,
        lastLogin: true,
        profileImageUrl: true,
        phoneNumber: true,
        preferredLanguage: true,
        theme: true,
        deletedAt: true,
      },
    });
  
    return users;
  }

  async uploadProfileImage(file: Express.Multer.File): Promise<string> {
    try {
      const uploadsDir = path.join(process.cwd(), 'backend', 'uploads', 'users');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, file.buffer);

      // Return the relative URL path to the uploaded image
      return `/uploads/users/${fileName}`;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw new InternalServerErrorException('Failed to upload profile image');
    }
  }

  async findUsersWithInvalidPharmacyId(): Promise<UserWithoutPassword[]> {
    const validPharmacies = await this.prisma.pharmacy.findMany({
      select: { id: true },
    });
    const validPharmacyIds = validPharmacies.map(p => p.id);

    const users = await this.prisma.user.findMany({
      where: {
        pharmacyId: {
          notIn: validPharmacyIds,
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        pharmacyId: true,
        role: true,
        branchId: true,
        lastLogin: true,
        profileImageUrl: true,
        phoneNumber: true,
        preferredLanguage: true,
        theme: true,
        deletedAt: true,
      },
    });

    return users;
  }

  async clearPharmacyIdForUsers(userIds: string[]): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        id: { in: userIds },
      },
      data: {
        pharmacyId: null,
      },
    });
  }

  async findOne(id: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        pharmacyId: true,
        role: true,
        branchId: true,
        lastLogin: true,
        profileImageUrl: true,
        phoneNumber: true,
        preferredLanguage: true,
        theme: true,
        deletedAt: true,
      },
    });
  
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const { email, password, name, role, pharmacyId, branchId } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (pharmacyId) {
      const pharmacy = await this.prisma.pharmacy.findUnique({
        where: { id: pharmacyId },
      });

      if (!pharmacy) {
        throw new BadRequestException(`Pharmacy with ID ${pharmacyId} not found`);
      }
    }

    if (branchId) {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
      });

      if (!branch) {
        throw new BadRequestException(`Branch with ID ${branchId} not found`);
      }

      if (pharmacyId && branch.pharmacyId !== pharmacyId) {
        throw new BadRequestException('Branch does not belong to the specified pharmacy');
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        pharmacyId,
        branchId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pharmacyId: true,
        branchId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        lastLogin: true,
        profileImageUrl: true,
        phoneNumber: true,
        preferredLanguage: true,
        theme: true,
        deletedAt: true,
      },
    });

    return newUser;
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email as string },
      });

      if (existingUser) {
        throw new ConflictException(`User with email ${data.email} already exists`);
      }
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password as string, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        branchId: true,
        pharmacyId: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        profileImageUrl: true,
        phoneNumber: true,
        preferredLanguage: true,
        theme: true,
        deletedAt: true,
      },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  async remove(id: string): Promise<UserWithoutPassword> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const salesCount = await this.prisma.sale.count({
      where: { soldById: id },
    });

    if (salesCount > 0) {
      throw new ConflictException(
        `Cannot delete user with ID ${id} because they have related sales records.`
      );
    }

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        branchId: true,
        pharmacyId: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        profileImageUrl: true,
        phoneNumber: true,
        preferredLanguage: true,
        theme: true,
        deletedAt: true,
      },
    });
  }
}
