import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePharmacyProfileDto } from './dto/update-pharmacy-profile.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPharmacyProfile(pharmacyId: string) {
    const pharmacy = await this.prisma.pharmacy.findUnique({
      where: { id: pharmacyId },
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    return pharmacy;
  }

  async updatePharmacyProfile(pharmacyId: string, updateData: UpdatePharmacyProfileDto) {
    const pharmacy = await this.prisma.pharmacy.update({
      where: { id: pharmacyId },
      data: updateData,
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    return pharmacy;
  }
}
