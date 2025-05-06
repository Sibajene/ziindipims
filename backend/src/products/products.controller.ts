import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, UploadedFile, UseInterceptors, BadRequestException, Request, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, Multer } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { Product, Role } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('supplier') supplier?: string,
    @Query('requiresPrescription') requiresPrescription?: string,
    @Query('pharmacyId') pharmacyId?: string,
  ): Promise<Product[]> {
    // Ensure user can only access their pharmacy's data
    if (pharmacyId && req.user.pharmacyId !== pharmacyId && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only access products for your own pharmacy');
    }

    // If no pharmacyId is provided, use the user's pharmacyId
    const effectivePharmacyId = pharmacyId || req.user.pharmacyId;
    
    // Only proceed if we have a pharmacyId
    if (!effectivePharmacyId) {
      throw new ForbiddenException('Pharmacy ID is required');
    }

    // Build the where clause for Prisma
    const where: any = {
      pharmacyId: effectivePharmacyId,
    };

    if (req.user.branchId) {
      where.batches = {
        some: {
          branchId: req.user.branchId,
        },
      };
    }

    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive'
      };
    }

    if (category) {
      where.category = category;
    }

    if (supplier) {
      where.supplierId = supplier;
    }

    if (requiresPrescription) {
      where.requiresPrescription = requiresPrescription === 'true';
    }

    return this.productsService.findAll({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
      where,
      orderBy: {
        name: 'asc'
      }
    });
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string): Promise<Product> {
    const product = await this.productsService.findOne(id);
    
    // Ensure user can only access their pharmacy's data
    if (product.pharmacyId !== req.user.pharmacyId && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only access products for your own pharmacy');
    }
    
    return product;
  }

  @Get(':id/stock')
  async getProductStock(@Request() req, @Param('id') id: string): Promise<any> {
    const product = await this.productsService.findOne(id);
    
    // Ensure user can only access their pharmacy's data
    if (product.pharmacyId !== req.user.pharmacyId && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only access products for your own pharmacy');
    }
    
    return this.productsService.getProductStock(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async create(@Request() req, @Body() createProductDto: CreateProductDto): Promise<Product> {
    console.log('Create product request user:', req.user);
    const { pharmacyId, branchId, ...rest } = createProductDto;
    console.log('Create product DTO pharmacyId:', pharmacyId);
    console.log('Create product DTO branchId:', branchId);

    // Ensure user can only create products for their pharmacy
    if (pharmacyId && req.user.pharmacyId !== pharmacyId && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only create products for your own pharmacy');
    }

    // Determine effective branchId
    let effectiveBranchId = branchId;
    if (req.user.role !== Role.OWNER) {
      // For Branch Manager and others, force branchId to user's branchId
      effectiveBranchId = req.user.branchId;
    }

    const data = {
      ...rest,
      pharmacy: { connect: { id: pharmacyId || req.user.pharmacyId } },
      // branchId is not in product model, so this is for reference or batch creation
      branchId: effectiveBranchId,
    };
    return this.productsService.create(data);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  async update(@Request() req, @Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productsService.findOne(id);

    // Ensure user can only update their pharmacy's products
    if (product.pharmacyId !== req.user.pharmacyId && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only update products for your own pharmacy');
    }

    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.OWNER)
  async remove(@Request() req, @Param('id') id: string): Promise<Product> {
    const product = await this.productsService.findOne(id);

    // Ensure user can only delete their pharmacy's products
    if (product.pharmacyId !== req.user.pharmacyId && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only delete products for your own pharmacy');
    }

    return this.productsService.remove(id);
  }

  @Post(':id/image')
  @Roles(Role.ADMIN, Role.OWNER, Role.MANAGER)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async uploadImage(@Request() req, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    const product = await this.productsService.findOne(id);

    // Ensure user can only upload images to their pharmacy's products
    if (product.pharmacyId !== req.user.pharmacyId && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only upload images for products in your own pharmacy');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.productsService.uploadProductImage(id, file.filename);
  }}
