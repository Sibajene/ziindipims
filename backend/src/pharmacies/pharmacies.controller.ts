import { Controller, Post, Body, Param, Put, Get, NotFoundException, InternalServerErrorException, UsePipes, ValidationPipe } from '@nestjs/common';
import { PharmaciesService } from './pharmacies.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';

@Controller('pharmacies')
export class PharmaciesController {
  constructor(private readonly pharmaciesService: PharmaciesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createPharmacy(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmaciesService.createPharmacy(createPharmacyDto);
  }

  @Put(':id/assign-user/:userId')
  async assignUserToPharmacy(@Param('id') pharmacyId: string, @Param('userId') userId: string) {
    try {
      await this.pharmaciesService.assignUserToPharmacy(pharmacyId, userId);
      const pharmacy = await this.getPharmacyById(pharmacyId);
      return pharmacy;
    } catch (error) {
      console.error(`Error in assignUserToPharmacy controller: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to assign user to pharmacy');
    }
  }

  @Get(':id')
  async getPharmacyById(@Param('id') id: string) {
    console.log(`API request received for pharmacy ID: ${id}`);
    
    try {
      const pharmacy = await this.pharmaciesService.getPharmacyById(id);
      
      if (!pharmacy) {
        throw new NotFoundException(`Pharmacy with ID ${id} not found`);
      }
      
      return pharmacy;
    } catch (error) {
      console.error(`Error in getPharmacyById controller: ${error.message}`);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Failed to retrieve pharmacy');
    }
  }
}
