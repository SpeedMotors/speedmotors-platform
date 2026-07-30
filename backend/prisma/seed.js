import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with default cars and user accounts...');

  // 1. Clear existing database tables in correct foreign-key order
  await prisma.partAllocation.deleteMany();
  await prisma.stockHistory.deleteMany();
  await prisma.sparePart.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.testDrive.deleteMany();
  await prisma.jobCard.deleteMany();
  await prisma.serviceBooking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Default Users (matching frontend logins)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'demo@admin.com',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });

  const sales = await prisma.user.create({
    data: {
      name: 'Sales Rep',
      email: 'demo@sales.com',
      password: hashedPassword,
      role: 'SALES'
    }
  });

  const technician = await prisma.user.create({
    data: {
      name: 'Tech Guru',
      email: 'demo@technician.com',
      password: hashedPassword,
      role: 'TECHNICIAN'
    }
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Valued Customer',
      email: 'demo@customer.com',
      password: hashedPassword,
      role: 'CUSTOMER'
    }
  });

  console.log('Default users created:', {
    admin: admin.email,
    sales: sales.email,
    technician: technician.email,
    customer: customer.email
  });

  // 3. Create Default Cars matching the frontend fleet
  const cars = [
    {
      id: 1,
      make: 'SpeedMotors',
      model: 'Elektrify X',
      year: 2026,
      price: 55000,
      type: 'SUV',
      image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800'],
      power: '450 hp',
      acceleration: '0-60 in 3.8s',
      range: '320 miles',
      topSpeed: '140 mph'
    },
    {
      id: 2,
      make: 'SpeedMotors',
      model: 'Aero Sedan',
      year: 2026,
      price: 42000,
      type: 'Sedan',
      image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800'],
      power: '320 hp',
      acceleration: '0-60 in 4.5s',
      range: '280 miles',
      topSpeed: '135 mph'
    },
    {
      id: 3,
      make: 'SpeedMotors',
      model: 'Thrust Coupe',
      year: 2025,
      price: 68000,
      type: 'Coupe',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'],
      power: '550 hp',
      acceleration: '0-60 in 3.2s',
      range: '250 miles',
      topSpeed: '180 mph'
    },
    {
      id: 4,
      make: 'SpeedMotors',
      model: 'Phantom SUV',
      year: 2026,
      price: 72000,
      type: 'SUV',
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800'],
      power: '600 hp',
      acceleration: '0-60 in 3.4s',
      range: '340 miles',
      topSpeed: '155 mph'
    },
    {
      id: 5,
      make: 'SpeedMotors',
      model: 'Velocity Roadster',
      year: 2024,
      price: 89000,
      type: 'Roadster',
      image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800'],
      power: '700 hp',
      acceleration: '0-60 in 2.8s',
      range: '220 miles',
      topSpeed: '200 mph'
    },
    {
      id: 6,
      make: 'SpeedMotors',
      model: 'Eco Hatch',
      year: 2026,
      price: 29000,
      type: 'Hatchback',
      image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800',
      images: ['https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800'],
      power: '201 hp',
      acceleration: '0-60 in 6.5s',
      range: '260 miles',
      topSpeed: '120 mph'
    }
  ];

  for (const car of cars) {
    await prisma.car.create({ data: car });
  }

  // Reset auto-increment sequence in PostgreSQL after manual ID inserts
  await prisma.$executeRawUnsafe(`SELECT setval('public."Car_id_seq"', (SELECT MAX(id) FROM public."Car"));`);

  console.log('Seeded 6 default cars successfully.');

  // 4. Seed Default Spare Parts
  console.log('Cleaning inventory tables...');
  await prisma.partAllocation.deleteMany();
  await prisma.stockHistory.deleteMany();
  await prisma.sparePart.deleteMany();

  console.log('Seeding default spare parts...');
  const spareParts = [
    {
      partNo: 'SM-SPK-100',
      name: 'Platinum Spark Plug',
      description: 'High performance spark plug for luxury inline engines',
      price: 12.50,
      stock: 45,
      minStock: 10,
      category: 'Engine Parts'
    },
    {
      partNo: 'SM-BRK-200',
      name: 'Ceramic Brake Pads Set',
      description: 'Premium ceramic brake pads for front wheel disc brakes',
      price: 85.00,
      stock: 3,
      minStock: 5,
      category: 'Brake Parts'
    },
    {
      partNo: 'SM-FLT-300',
      name: 'Engine Oil Filter',
      description: 'Full synthetic engine oil filter cartridge',
      price: 15.00,
      stock: 0,
      minStock: 8,
      category: 'Filters'
    },
    {
      partNo: 'SM-BAT-400',
      name: '12V Lead-Acid Battery',
      description: 'Heavy duty 12V starting battery',
      price: 120.00,
      stock: 15,
      minStock: 2,
      category: 'Electrical'
    }
  ];

  for (const part of spareParts) {
    const createdPart = await prisma.sparePart.create({ data: part });
    await prisma.stockHistory.create({
      data: {
        partId: createdPart.id,
        type: 'ADJUST',
        quantity: createdPart.stock,
        reason: 'Initial database seeding',
        userId: admin.id
      }
    });
  }
  console.log('Seeded default spare parts successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding critical error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
