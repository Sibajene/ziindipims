import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Enable CORS for frontend requests
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://ziindi-frontend.onrender.com',  // <- Add this
    ],
    credentials: true,
  });
  
  
  // Serve static files from uploads directory
  // Fix static path to absolute path to backend/uploads
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );
  
  // Prisma shutdown hook
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  
  // Remove the problematic route logging code
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);

}
bootstrap();
