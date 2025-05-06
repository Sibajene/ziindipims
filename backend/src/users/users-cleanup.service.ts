import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from './users.service';

@Injectable()
export class UsersCleanupService {
  private readonly logger = new Logger(UsersCleanupService.name);

  constructor(private readonly usersService: UsersService) {}

  async cleanupInvalidPharmacyIds() {
    this.logger.log('Starting cleanup of users with invalid pharmacyId...');
    const usersWithInvalidPharmacy = await this.usersService.findUsersWithInvalidPharmacyId();

    if (usersWithInvalidPharmacy.length === 0) {
      this.logger.log('No users with invalid pharmacyId found.');
      return;
    }

    const userIds = usersWithInvalidPharmacy.map(user => user.id);
    this.logger.log(`Found ${userIds.length} users with invalid pharmacyId. Clearing pharmacyId for these users...`);

    await this.usersService.clearPharmacyIdForUsers(userIds);

    this.logger.log('Cleanup completed. Cleared pharmacyId for users with invalid pharmacyId.');
  }
}
