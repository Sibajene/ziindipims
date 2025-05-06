import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { Role } from '.prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a pharmacy
  const pharmacy = await prisma.pharmacy.create({
    data: {
      name: 'HilbenGrace Pharmacy',
      address: '123 Health Street, Medical District',
      phone: '+1234567890',
      email: 'info@hilbengrace.com',
      license: 'PHM12345',
      taxId: 'TX98765',
    },
  });

  // Create a branch
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Branch',
      location: 'Downtown',
      phone: '+1234567891',
      email: 'main@hilbengrace.com',
      pharmacyId: pharmacy.id,
    },
  });

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@ziindipro.com',
      password: hashedPassword,
      role: Role.ADMIN,
      branchId: branch.id,
    },
  });

  // Create some suppliers
  const supplier = await prisma.supplier.create({
    data: {
      name: 'MediSupply Inc.',
      phone: '+1234567892',
      email: 'orders@medisupply.com',
      address: '456 Pharma Road',
      contactPerson: 'John Supplier',
    },
  });

  // Create some products with proper relations
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Paracetamol 500mg',
        genericName: 'Paracetamol',
        dosageForm: 'Tablet',
        strength: '500mg',
        barcode: 'PARA500T',
        unitPrice: 0.5,
        pharmacy: {
          connect: {
            id: pharmacy.id
          }
        },
        supplier: {
          connect: {
            id: supplier.id
          }
        }
      },
    }),
    prisma.product.create({
      data: {
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        dosageForm: 'Capsule',
        strength: '250mg',
        barcode: 'AMOX250C',
        requiresPrescription: true,
        unitPrice: 1.2,
        pharmacy: {
          connect: {
            id: pharmacy.id
          }
        },
        supplier: {
          connect: {
            id: supplier.id
          }
        }
      },
    }),
  ]);

  // Create inventory batches
  await Promise.all(
    products.map((product) =>
      prisma.batch.create({
        data: {
          productId: product.id,
          branchId: branch.id,
          quantity: 100,
          batchNumber: `BN${Math.floor(Math.random() * 10000)}`,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          costPrice: product.unitPrice * 0.7,
          sellingPrice: product.unitPrice,
        },
      })
    )
  );

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });