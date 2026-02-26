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

  // --- Outlets ---
  console.log('Seeding outlets...');

  await prisma.outlet.upsert({
    where: { outlet_id: 'outlet-b6-chicken-rice' },
    update: {},
    create: {
      outlet_id: 'outlet-b6-chicken-rice',
      outlet_name: 'B6 Chicken Rice',
      slot_capacity: 18,
    },
  });

  await prisma.outlet.upsert({
    where: { outlet_id: 'outlet-b6-noodles' },
    update: {},
    create: {
      outlet_id: 'outlet-b6-noodles',
      outlet_name: 'B6 Noodles',
      slot_capacity: 14,
    },
  });

  console.log('Seeding complete: 2 outlets created.');

  // --- Menu Items ---
  console.log('Seeding menu items...');

  const menuItems = [
    {
      item_id: 'item-cr-01',
      outlet_id: 'outlet-b6-chicken-rice',
      name: 'Roasted Chicken Rice',
      description: 'Signature roasted chicken with fragrant rice',
      price: 4.5,
      currency: 'SGD',
      is_available: true,
      availability_status: 'available' as const,
    },
    {
      item_id: 'item-cr-02',
      outlet_id: 'outlet-b6-chicken-rice',
      name: 'Steamed Chicken Rice',
      description: null,
      price: 4.2,
      currency: 'SGD',
      is_available: true,
      availability_status: 'limited' as const,
    },
    {
      item_id: 'item-cr-03',
      outlet_id: 'outlet-b6-chicken-rice',
      name: 'Braised Tofu Set',
      description: null,
      price: 3.8,
      currency: 'SGD',
      is_available: false,
      availability_status: 'sold_out' as const,
    },
    {
      item_id: 'item-n-01',
      outlet_id: 'outlet-b6-noodles',
      name: 'Fishball Noodle Soup',
      description: null,
      price: 4.0,
      currency: 'SGD',
      is_available: true,
      availability_status: 'available' as const,
    },
    {
      item_id: 'item-n-02',
      outlet_id: 'outlet-b6-noodles',
      name: 'Dry Wanton Mee',
      description: null,
      price: 4.6,
      currency: 'SGD',
      is_available: true,
      availability_status: 'available' as const,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { item_id: item.item_id },
      update: {},
      create: item,
    });
  }

  console.log('Seeding complete: 5 menu items created.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
