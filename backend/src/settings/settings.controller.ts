import { Controller, Get, Patch, Body, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdatePharmacyProfileDto } from './dto/update-pharmacy-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('pharmacy')
  async getPharmacyProfile(@Req() req: any) {
    const pharmacyId = req.user?.pharmacyId;
    if (!pharmacyId) {
      throw new Error('User pharmacyId not found');
    }
    return this.settingsService.getPharmacyProfile(pharmacyId);
  }

  @Patch('pharmacy')
  async updatePharmacyProfile(@Req() req: any, @Body() updateDto: UpdatePharmacyProfileDto) {
    const pharmacyId = req.user?.pharmacyId;
    if (!pharmacyId) {
      throw new Error('User pharmacyId not found');
    }
    return this.settingsService.updatePharmacyProfile(pharmacyId, updateDto);
  }
}
