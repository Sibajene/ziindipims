import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.PHARMACIST, Role.ASSISTANT, Role.OWNER)
  findAll(@Request() req) {
    return this.branchesService.findAll(req.user.id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.PHARMACIST, Role.ASSISTANT, Role.OWNER)
  findOne(@Param('id') id: string) {
    return this.branchesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OWNER)
  create(@Body() createBranchDto: CreateBranchDto, @Request() req) {
    return this.branchesService.create(createBranchDto, req.user.id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  update(
    @Param('id') id: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @Request() req,
  ) {
    return this.branchesService.update(id, updateBranchDto, req.user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  remove(@Param('id') id: string, @Request() req) {
    return this.branchesService.remove(id, req.user.id);
  }
}