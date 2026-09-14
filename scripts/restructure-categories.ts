// Script to restructure categories into Men/Women with subcategories
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Restructuring categories for Men & Women...\n');

  // Step 1: Get existing categories
  const existingCategories = await prisma.category.findMany({
    include: { subCategories: true, products: true },
    orderBy: { order: 'asc' },
  });

  console.log('Existing categories:');
  existingCategories.forEach((cat) => {
    console.log(`  - ${cat.name} (${cat.products.length} products, ${cat.subCategories.length} subcats)`);
  });

  // Step 2: Create "Men" and "Women" top-level categories
  const menCategory = await prisma.category.upsert({
    where: { slug: 'men' },
    update: { name: 'Men', order: 1 },
    create: { name: 'Men', slug: 'men', order: 1, description: "Shop luxury men's collection" },
  });

  const womenCategory = await prisma.category.upsert({
    where: { slug: 'women' },
    update: { name: 'Women', order: 2 },
    create: { name: 'Women', slug: 'women', order: 2, description: "Shop luxury women's collection" },
  });

  console.log(`\nCreated top-level categories: Men (${menCategory.id}), Women (${womenCategory.id})`);

  // Step 3: Define subcategories for each gender
  const subCategoryDefs = [
    { name: 'Shoes', slug: 'shoes', description: 'Luxury shoes' },
    { name: 'Bags', slug: 'bags', description: 'Designer bags & purses' },
    { name: 'Belts', slug: 'belts', description: 'Premium leather belts' },
    { name: 'Wallets', slug: 'wallets', description: 'Designer wallets & cardholders' },
    { name: 'Accessories', slug: 'accessories', description: 'Luxury accessories' },
    { name: 'Ready-to-Wear', slug: 'ready-to-wear', description: 'Designer clothing' },
  ];

  // Create subcategories under Men
  for (const subDef of subCategoryDefs) {
    const menSlug = `men-${subDef.slug}`;
    const existing = await prisma.subCategory.findFirst({ where: { slug: menSlug } });
    if (!existing) {
      await prisma.subCategory.create({
        data: {
          name: subDef.name,
          slug: menSlug,
          description: `Men's ${subDef.description}`,
          categoryId: menCategory.id,
        },
      });
    }
  }

  // Create subcategories under Women
  for (const subDef of subCategoryDefs) {
    const womenSlug = `women-${subDef.slug}`;
    const existing = await prisma.subCategory.findFirst({ where: { slug: womenSlug } });
    if (!existing) {
      await prisma.subCategory.create({
        data: {
          name: subDef.name,
          slug: womenSlug,
          description: `Women's ${subDef.description}`,
          categoryId: womenCategory.id,
        },
      });
    }
  }

  console.log('Created subcategories under Men and Women');

  // Step 4: Get the newly created subcategories
  const menSubCategories = await prisma.subCategory.findMany({
    where: { categoryId: menCategory.id },
  });
  const womenSubCategories = await prisma.subCategory.findMany({
    where: { categoryId: womenCategory.id },
  });

  // Step 5: Reassign existing products
  const allProducts = await prisma.product.findMany({
    include: { category: true, subCategory: true },
  });

  const categoryMapping: Record<string, { defaultGender: 'men' | 'women' }> = {
    shoes: { defaultGender: 'women' },
    bags: { defaultGender: 'women' },
    belts: { defaultGender: 'men' },
    wallets: { defaultGender: 'men' },
    accessories: { defaultGender: 'women' },
    'ready-to-wear': { defaultGender: 'women' },
  };

  const womenKeywords = ['heel', 'clutch', 'tote', 'dress', 'sandal', 'shoulder bag', 'crossbody', 'scarf', 'sunglass', 'chain', 'mini'];
  const menKeywords = ['loafer', 'sneaker', 'boot', 'oxford', 'derby', 'bifold', 'cardholder', 'jacket', 'shirt', 'briefcase', 'monogram'];

  let menCount = 0;
  let womenCount = 0;

  for (const product of allProducts) {
    const oldCatSlug = product.category?.slug || '';
    const productName = product.name.toLowerCase();

    let gender: 'men' | 'women' = 'women';
    const mapping = categoryMapping[oldCatSlug];
    if (mapping) gender = mapping.defaultGender;

    if (menKeywords.some((kw) => productName.includes(kw))) gender = 'men';
    if (womenKeywords.some((kw) => productName.includes(kw))) gender = 'women';

    const targetCategory = gender === 'men' ? menCategory : womenCategory;
    const targetSubCategories = gender === 'men' ? menSubCategories : womenSubCategories;

    let newSubCat = targetSubCategories.find((sc) => {
      const baseSlug = sc.slug.replace(/^(men|women)-/, '');
      return baseSlug === oldCatSlug;
    });

    if (!newSubCat && product.subCategory) {
      const oldSubCatName = product.subCategory.name.toLowerCase();
      newSubCat = targetSubCategories.find((sc) => sc.name.toLowerCase() === oldSubCatName);
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        categoryId: targetCategory.id,
        subCategoryId: newSubCat?.id || null,
      },
    });

    if (gender === 'men') menCount++;
    else womenCount++;
  }

  console.log(`\nReassigned products: ${menCount} to Men, ${womenCount} to Women`);

  // Step 6: Delete old empty categories
  const oldCategories = existingCategories.filter(
    (c) => c.slug !== 'men' && c.slug !== 'women'
  );

  for (const oldCat of oldCategories) {
    const remainingProducts = await prisma.product.count({
      where: { categoryId: oldCat.id },
    });

    if (remainingProducts === 0) {
      await prisma.subCategory.deleteMany({ where: { categoryId: oldCat.id } });
      await prisma.category.delete({ where: { id: oldCat.id } });
      console.log(`  Deleted old category: ${oldCat.name}`);
    } else {
      console.log(`  Kept category ${oldCat.name} (${remainingProducts} products still linked)`);
    }
  }

  // Step 7: Verify
  const finalCategories = await prisma.category.findMany({
    include: {
      subCategories: true,
      _count: { select: { products: true } },
    },
    orderBy: { order: 'asc' },
  });

  console.log('\nFinal category structure:');
  for (const cat of finalCategories) {
    console.log(`  ${cat.name} (${cat._count.products} products)`);
    for (const sub of cat.subCategories) {
      const subProductCount = await prisma.product.count({ where: { subCategoryId: sub.id } });
      console.log(`    - ${sub.name} (${subProductCount} products)`);
    }
  }
}

main()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
