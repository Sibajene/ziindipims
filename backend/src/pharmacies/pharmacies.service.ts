import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';

@Injectable()
export class PharmaciesService {
  constructor(private readonly prisma: PrismaService) {}

  async createPharmacy(createPharmacyDto: CreatePharmacyDto) {
    const pharmacy = await this.prisma.pharmacy.create({
      data: createPharmacyDto,
    });
    console.log(`Created pharmacy with ID: ${pharmacy.id}, Name: ${pharmacy.name}`);
    return pharmacy;
  }

  async assignUserToPharmacy(pharmacyId: string, userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { pharmacyId },
    });
  }

  async getPharmacyById(pharmacyId: string) {
    console.log(`Backend service: Fetching pharmacy with ID: ${pharmacyId}`);
    
    try {
      const pharmacy = await this.prisma.pharmacy.findUnique({
        where: { id: pharmacyId },
      });
      
      if (!pharmacy) {
        console.log(`Backend service: Pharmacy with ID ${pharmacyId} not found.`);
        return null;
      } else {
        console.log(`Backend service: Pharmacy found: ${pharmacy.name}`);
        return pharmacy;
      }
    } catch (error) {
      console.error(`Backend service: Error fetching pharmacy:`, error);
      throw error;
    }
  }

  async getAllPharmacies() {
    const pharmacies = await this.prisma.pharmacy.findMany();
    console.log(`Found ${pharmacies.length} pharmacies in the database.`);
    return pharmacies;
  }
}
