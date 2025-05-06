import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { User, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as multer from 'multer';


@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
  async findAll(@Req() req): Promise<Omit<User, 'password'>[]> {
    const user = req.user;
    return this.usersService.findAll(user.role, user.pharmacyId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  async findOne(@Param('id') id: string): Promise<Omit<User, 'password'>> {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OWNER)
  async create(@Request() req, @Body() createUserDto: CreateUserDto) {
    const creatorPharmacyId = req.user.pharmacyId;
    if (creatorPharmacyId && !createUserDto.pharmacyId) {
      createUserDto.pharmacyId = creatorPharmacyId;
    }
    // Only assign branchId if role is not OWNER (Pharmacy Owner)
    if (req.user.branchId && !createUserDto.branchId && createUserDto.role !== Role.OWNER) {
      createUserDto.branchId = req.user.branchId;
    }
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  async removeUser(@Param('id') id: string): Promise<Omit<User, 'password'>> {
    return this.usersService.remove(id);
  }

  @Post('upload-profile-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.memoryStorage(),
  }))
  async uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
    const imageUrl = await this.usersService.uploadProfileImage(file);
    return { url: imageUrl, success: true };
  }
}
