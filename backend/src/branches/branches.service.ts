import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    // Get the user's pharmacyId from the user table
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pharmacyId: true },
    });

    if (!user || !user.pharmacyId) {
      return [];
    }

    return this.prisma.branch.findMany({
      where: {
        isActive: true,
        pharmacyId: user.pharmacyId,
      },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  async create(createBranchDto: CreateBranchDto, userId: string) {
    // Get the user's pharmacyId from the user table
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pharmacyId: true },
    });

    if (!user || !user.pharmacyId) {
      throw new Error('User pharmacy not found');
    }

    // Ensure we're providing all required fields from the schema
    return this.prisma.branch.create({
      data: {
        name: createBranchDto.name,
        location: createBranchDto.location,
        phone: createBranchDto.phone,
        email: createBranchDto.email,
        managerEmail: createBranchDto.managerEmail,
        pharmacyId: user.pharmacyId,
        openingHours: createBranchDto.openingHours,
        gpsCoordinates: createBranchDto.gpsCoordinates,
        isActive: true,
        createdBy: userId,
      },
    });
  }

  async update(id: string, updateBranchDto: UpdateBranchDto, userId: string) {
    // Check if branch exists
    await this.findOne(id);

    return this.prisma.branch.update({
      where: { id },
      data: {
        ...updateBranchDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check if branch exists
    await this.findOne(id);

    // Use isActive flag instead of deletedAt
    return this.prisma.branch.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    });
  }
}