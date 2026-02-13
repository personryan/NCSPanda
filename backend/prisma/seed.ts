import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roles...');

  await prisma.role.upsert({
    where: { role_id: 1 },
    update: {},
    create: {
      role_id: 1,
      role_name: 'customer',
      description: 'Regular customer who can browse menu and place orders',
    },
  });

  await prisma.role.upsert({
    where: { role_id: 2 },
    update: {},
    create: {
      role_id: 2,
      role_name: 'vendor',
      description: 'Store owner who can manage incoming orders',
    },
  });

  await prisma.role.upsert({
    where: { role_id: 3 },
    update: {},
    create: {
      role_id: 3,
      role_name: 'admin',
      description: 'System administrator with full access to all features',
    },
  });

  console.log('Seeding complete: 3 roles created.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
