import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  // Create Unisex category
  const unisex = await prisma.category.upsert({
    where: { slug: 'unisex' },
    update: { name: 'Unisex', order: 3 },
    create: { name: 'Unisex', slug: 'unisex', order: 3, description: 'Shop luxury unisex collection' },
  });
  console.log('Created Unisex category:', unisex.id);

  // Create subcategories
  const subs = [
    { name: 'Shoes', slug: 'unisex-shoes', description: 'Unisex luxury shoes' },
    { name: 'Bags', slug: 'unisex-bags', description: 'Unisex designer bags' },
    { name: 'Belts', slug: 'unisex-belts', description: 'Unisex premium belts' },
    { name: 'Wallets', slug: 'unisex-wallets', description: 'Unisex designer wallets' },
    { name: 'Accessories', slug: 'unisex-accessories', description: 'Unisex luxury accessories' },
    { name: 'Ready-to-Wear', slug: 'unisex-ready-to-wear', description: 'Unisex designer clothing' },
  ];
  for (const s of subs) {
    const exists = await prisma.subCategory.findFirst({ where: { slug: s.slug } });
    if (!exists) {
      await prisma.subCategory.create({ data: { ...s, categoryId: unisex.id } });
      console.log('  Created sub:', s.name);
    } else {
      console.log('  Sub already exists:', s.name);
    }
  }

  // Verify
  const result = await prisma.category.findUnique({
    where: { id: unisex.id },
    include: { subCategories: true, _count: { select: { products: true } } },
  });
  console.log('Unisex category:', result.name, '-', result.subCategories.length, 'subcategories,', result._count.products, 'products');
}
main().catch(console.error).finally(() => prisma.$disconnect());
