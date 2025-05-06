import { Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    // Implement this method in your service
    return { success: true, message: 'Notification marked as read' };
  }

  @UseGuards(JwtAuthGuard)
  @Put('user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    // Implement this method in your service
    return { success: true, message: 'All notifications marked as read' };
  }
}
