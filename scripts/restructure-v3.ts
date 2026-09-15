import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Restructuring: Real subcategories + gender field on products...\n');

  // Step 1: Delete all existing subcategories (Men/Women/Unisex under each category)
  const deleteResult = await prisma.subCategory.deleteMany({});
  console.log(`Deleted ${deleteResult.count} old subcategories`);

  // Step 2: Create REAL subcategories under each category
  const subCategoryMap: Record<string, Array<{ name: string; slug: string; description: string }>> = {
    shoes: [
      { name: 'Sneakers', slug: 'sneakers', description: 'Designer sneakers' },
      { name: 'Loafers', slug: 'loafers', description: 'Classic loafers' },
      { name: 'Boots', slug: 'boots', description: 'Luxury boots' },
      { name: 'Heels', slug: 'heels', description: 'Designer heels' },
      { name: 'Sandals', slug: 'sandals', description: 'Premium sandals' },
      { name: 'Flats', slug: 'flats', description: 'Elegant flats' },
      { name: 'Oxfords', slug: 'oxfords', description: 'Classic oxfords' },
    ],
    bags: [
      { name: 'Tote Bags', slug: 'tote-bags', description: 'Spacious tote bags' },
      { name: 'Crossbody Bags', slug: 'crossbody-bags', description: 'Crossbody bags' },
      { name: 'Clutches', slug: 'clutches', description: 'Evening clutches' },
      { name: 'Backpacks', slug: 'backpacks', description: 'Luxury backpacks' },
      { name: 'Shoulder Bags', slug: 'shoulder-bags', description: 'Shoulder bags' },
      { name: 'Mini Bags', slug: 'mini-bags', description: 'Mini bags' },
      { name: 'Briefcases', slug: 'briefcases', description: 'Designer briefcases' },
    ],
    belts: [
      { name: 'Formal Belts', slug: 'formal-belts', description: 'Formal leather belts' },
      { name: 'Casual Belts', slug: 'casual-belts', description: 'Casual belts' },
      { name: 'Statement Belts', slug: 'statement-belts', description: 'Statement belts' },
    ],
    wallets: [
      { name: 'Cardholders', slug: 'cardholders', description: 'Compact cardholders' },
      { name: 'Bifold Wallets', slug: 'bifold-wallets', description: 'Bifold wallets' },
      { name: 'Long Wallets', slug: 'long-wallets', description: 'Long wallets' },
    ],
    accessories: [
      { name: 'Scarves', slug: 'scarves', description: 'Silk scarves' },
      { name: 'Sunglasses', slug: 'sunglasses', description: 'Designer sunglasses' },
      { name: 'Jewelry', slug: 'jewelry', description: 'Fine jewelry' },
      { name: 'Watches', slug: 'watches', description: 'Luxury watches' },
      { name: 'Hats & Caps', slug: 'hats-caps', description: 'Designer hats & caps' },
      { name: 'Ties', slug: 'ties', description: 'Silk ties' },
      { name: 'Cufflinks', slug: 'cufflinks', description: 'Designer cufflinks' },
    ],
    'ready-to-wear': [
      { name: 'Jackets', slug: 'jackets', description: 'Designer jackets' },
      { name: 'Dresses', slug: 'dresses', description: 'Luxury dresses' },
      { name: 'Shirts', slug: 'shirts', description: 'Premium shirts' },
      { name: 'Trousers', slug: 'trousers', description: 'Designer trousers' },
      { name: 'Coats', slug: 'coats', description: 'Luxury coats' },
      { name: 'Knitwear', slug: 'knitwear', description: 'Designer knitwear' },
    ],
  };

  const categories = await prisma.category.findMany({ orderBy: { order: 'asc' } });

  for (const cat of categories) {
    const subs = subCategoryMap[cat.slug] || [];
    for (const sub of subs) {
      await prisma.subCategory.create({
        data: {
          name: sub.name,
          slug: `${cat.slug}-${sub.slug}`,
          description: sub.description,
          categoryId: cat.id,
        },
      });
    }
    console.log(`  ${cat.name}: created ${subs.length} subcategories`);
  }

  // Step 3: Reassign products - set gender based on current subcategory, then match to new subcategory
  const allProducts = await prisma.product.findMany({
    include: { category: true, subCategory: true },
  });

  // Keywords for matching products to subcategories
  const subCategoryKeywords: Record<string, string[]> = {
    sneakers: ['sneaker', 'trainer', 'runner'],
    loafers: ['loafer', 'mule', 'slip-on'],
    boots: ['boot', 'ankle boot', 'knee-high'],
    heels: ['heel', 'pump', 'stiletto', 'kitten heel'],
    sandals: ['sandal', 'slide', 'espadrille'],
    flats: ['flat', 'ballet'],
    oxfords: ['oxford', 'derby', 'brogue'],
    'tote-bags': ['tote'],
    'crossbody-bags': ['crossbody', 'cross body'],
    clutches: ['clutch', 'evening bag'],
    backpacks: ['backpack'],
    'shoulder-bags': ['shoulder', 'hobo'],
    'mini-bags': ['mini', 'nano', 'micro'],
    briefcases: ['briefcase', 'messenger'],
    'formal-belts': ['formal belt', 'dress belt'],
    'casual-belts': ['casual belt', 'canvas belt'],
    'statement-belts': ['statement belt', 'wide belt'],
    cardholders: ['cardholder', 'card holder'],
    'bifold-wallets': ['bifold', 'bi-fold'],
    'long-wallets': ['long wallet', 'continental'],
    scarves: ['scarf', 'shawl'],
    sunglasses: ['sunglass', 'aviator', 'wayfarer'],
    jewelry: ['ring', 'bracelet', 'necklace', 'earring', 'chain'],
    watches: ['watch', 'timepiece'],
    'hats-caps': ['hat', 'cap', 'beanie', 'beret', 'bucket'],
    ties: ['tie', 'necktie', 'bow tie'],
    cufflinks: ['cufflink', 'cuff link'],
    jackets: ['jacket', 'blazer', 'bomber'],
    dresses: ['dress', 'gown'],
    shirts: ['shirt', 'blouse', 'polo'],
    trousers: ['trouser', 'pant', 'jean'],
    coats: ['coat', 'overcoat', 'trench'],
    knitwear: ['knit', 'sweater', 'cardigan', 'pullover'],
  };

  const menKeywords = ['loafer', 'sneaker', 'boot', 'oxford', 'derby', 'bifold', 'cardholder', 'briefcase', 'messenger', 'tie', 'cufflink', 'trouser', 'jacket', 'coat', 'shirt'];
  const womenKeywords = ['heel', 'clutch', 'tote', 'dress', 'sandal', 'shoulder bag', 'crossbody', 'scarf', 'sunglass', 'chain', 'mini', 'nano', 'flat', 'ballet', 'hobo'];

  let updated = 0;
  for (const product of allProducts) {
    const name = product.name.toLowerCase();

    // Determine gender
    let gender = 'women'; // default
    if (menKeywords.some(kw => name.includes(kw))) gender = 'men';
    if (womenKeywords.some(kw => name.includes(kw))) gender = 'women';

    // If current subcategory was Men/Women/Unisex (old structure), use that for gender
    if (product.subCategory) {
      const subName = product.subCategory.name.toLowerCase();
      if (subName === 'men') gender = 'men';
      else if (subName === 'women') gender = 'women';
      else if (subName === 'unisex') gender = 'unisex';
    }

    // Find best matching subcategory under the product's category
    const catSlug = product.category?.slug || '';
    let bestSubId: string | null = null;

    for (const [subSlugBase, keywords] of Object.entries(subCategoryKeywords)) {
      if (keywords.some(kw => name.includes(kw))) {
        const fullSlug = `${catSlug}-${subSlugBase}`;
        const sub = await prisma.subCategory.findFirst({ where: { slug: fullSlug } });
        if (sub) {
          bestSubId = sub.id;
          break;
        }
      }
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        gender,
        subCategoryId: bestSubId,
      },
    });
    updated++;
  }

  console.log(`\nUpdated ${updated} products with gender + subcategory`);

  // Step 4: Verify
  const finalCats = await prisma.category.findMany({
    include: {
      subCategories: true,
      _count: { select: { products: true } },
    },
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

  // Gender breakdown
  const menCount = await prisma.product.count({ where: { gender: 'men' } });
  const womenCount = await prisma.product.count({ where: { gender: 'women' } });
  const unisexCount = await prisma.product.count({ where: { gender: 'unisex' } });
  const nullCount = await prisma.product.count({ where: { gender: null } });
  console.log(`\nGender breakdown: Men=${menCount}, Women=${womenCount}, Unisex=${unisexCount}, None=${nullCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
