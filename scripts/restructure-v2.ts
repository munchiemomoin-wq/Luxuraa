import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Restructuring: Product-type Categories + Gender SubCategories...\n');

  // Step 1: Get current state
  const currentCats = await prisma.category.findMany({
    include: { subCategories: true, _count: { select: { products: true } } },
    orderBy: { order: 'asc' },
  });
  console.log('Current categories:');
  currentCats.forEach(c => console.log(`  ${c.name} (${c._count.products} products, ${c.subCategories.length} subs)`));

  // Step 2: Create product-type categories
  const categoryDefs = [
    { name: 'Shoes', slug: 'shoes', order: 1, description: 'Luxury shoes' },
    { name: 'Bags', slug: 'bags', order: 2, description: 'Designer bags & purses' },
    { name: 'Belts', slug: 'belts', order: 3, description: 'Premium leather belts' },
    { name: 'Wallets', slug: 'wallets', order: 4, description: 'Designer wallets & cardholders' },
    { name: 'Accessories', slug: 'accessories', order: 5, description: 'Luxury accessories' },
    { name: 'Ready-to-Wear', slug: 'ready-to-wear', order: 6, description: 'Designer clothing' },
  ];

  const genderDefs = [
    { name: 'Men', slug: 'men' },
    { name: 'Women', slug: 'women' },
    { name: 'Unisex', slug: 'unisex' },
  ];

  // Create categories
  const newCategories: any[] = [];
  for (const catDef of categoryDefs) {
    const cat = await prisma.category.upsert({
      where: { slug: catDef.slug },
      update: { name: catDef.name, order: catDef.order, description: catDef.description },
      create: catDef,
    });
    newCategories.push(cat);
    console.log(`  Category: ${cat.name} (${cat.id})`);
  }

  // Step 3: Create gender subcategories under each category
  for (const cat of newCategories) {
    for (const gender of genderDefs) {
      const subSlug = `${cat.slug}-${gender.slug}`;
      const existing = await prisma.subCategory.findFirst({ where: { slug: subSlug } });
      if (!existing) {
        await prisma.subCategory.create({
          data: {
            name: gender.name,
            slug: subSlug,
            description: `${gender.name}'s ${cat.name}`,
            categoryId: cat.id,
          },
        });
        console.log(`    Created sub: ${cat.name} → ${gender.name}`);
      } else {
        // Update existing to point to correct category
        await prisma.subCategory.update({
          where: { id: existing.id },
          data: { categoryId: cat.id, name: gender.name },
        });
        console.log(`    Updated sub: ${cat.name} → ${gender.name}`);
      }
    }
  }

  // Step 4: Reassign all products
  // Strategy: figure out what gender + product-type each product currently belongs to
  const allProducts = await prisma.product.findMany({
    include: { category: true, subCategory: true },
  });

  // Map old "Men"/"Women"/"Unisex" category + subcategory to new category + subcategory
  // Old structure: category=Men, subcategory=Shoes → new: category=Shoes, subcategory=Men
  let reassigned = 0;
  for (const product of allProducts) {
    const oldCatSlug = product.category?.slug || '';
    const oldSubCatName = product.subCategory?.name || '';
    const oldSubCatSlug = product.subCategory?.slug || '';

    let newCatSlug = '';
    let newGenderSlug = '';

    // If old category was a gender (men/women/unisex) and subcategory was a product type
    if (['men', 'women', 'unisex'].includes(oldCatSlug)) {
      newGenderSlug = oldCatSlug;
      // The subcategory name is the product type (Shoes, Bags, etc.)
      const subNameLower = oldSubCatName.toLowerCase();
      if (subNameLower === 'shoes') newCatSlug = 'shoes';
      else if (subNameLower === 'bags') newCatSlug = 'bags';
      else if (subNameLower === 'belts') newCatSlug = 'belts';
      else if (subNameLower === 'wallets') newCatSlug = 'wallets';
      else if (subNameLower === 'accessories') newCatSlug = 'accessories';
      else if (subNameLower === 'ready-to-wear' || subNameLower === 'ready to wear') newCatSlug = 'ready-to-wear';
      else {
        // Try to infer from product name
        const name = product.name.toLowerCase();
        if (name.includes('shoe') || name.includes('sneaker') || name.includes('loafer') || name.includes('boot') || name.includes('heel') || name.includes('sandal')) newCatSlug = 'shoes';
        else if (name.includes('bag') || name.includes('tote') || name.includes('clutch') || name.includes('crossbody') || name.includes('backpack')) newCatSlug = 'bags';
        else if (name.includes('belt')) newCatSlug = 'belts';
        else if (name.includes('wallet') || name.includes('cardholder')) newCatSlug = 'wallets';
        else newCatSlug = 'accessories';
      }
    } else {
      // Old category was already a product type (shoes, bags, etc.)
      newCatSlug = oldCatSlug;
      newGenderSlug = oldSubCatSlug.replace(`${oldCatSlug}-`, '') || 'women';
    }

    // Find the new category
    const newCat = newCategories.find(c => c.slug === newCatSlug);
    if (!newCat) {
      console.log(`  SKIP product "${product.name}" - no matching category for slug "${newCatSlug}"`);
      continue;
    }

    // Find the new subcategory (gender under product type)
    const newSubSlug = `${newCatSlug}-${newGenderSlug}`;
    const newSub = await prisma.subCategory.findFirst({ where: { slug: newSubSlug } });

    await prisma.product.update({
      where: { id: product.id },
      data: {
        categoryId: newCat.id,
        subCategoryId: newSub?.id || null,
      },
    });
    reassigned++;
  }

  console.log(`\nReassigned ${reassigned} products`);

  // Step 5: Delete old gender-based categories (men, women, unisex) and their subs
  for (const oldCat of currentCats) {
    if (['men', 'women', 'unisex'].includes(oldCat.slug)) {
      const remaining = await prisma.product.count({ where: { categoryId: oldCat.id } });
      if (remaining === 0) {
        await prisma.subCategory.deleteMany({ where: { categoryId: oldCat.id } });
        await prisma.category.delete({ where: { id: oldCat.id } });
        console.log(`  Deleted old category: ${oldCat.name}`);
      } else {
        console.log(`  WARNING: ${oldCat.name} still has ${remaining} products!`);
      }
    }
  }

  // Step 6: Verify final state
  const finalCats = await prisma.category.findMany({
    include: { subCategories: true, _count: { select: { products: true } } },
    orderBy: { order: 'asc' },
  });

  console.log('\nFinal structure:');
  for (const cat of finalCats) {
    console.log(`  ${cat.name} (${cat._count.products} products)`);
    for (const sub of cat.subCategories) {
      const count = await prisma.product.count({ where: { subCategoryId: sub.id } });
      console.log(`    └─ ${sub.name} (${count} products)`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
