import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding luxury e-commerce database...');

  // Clear existing data
  await prisma.productTag.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.subCategory.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  // Brands
  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        name: 'Gucci',
        slug: 'gucci',
        description: 'Italian luxury fashion house founded in Florence, renowned for its bold and eclectic designs that blend modernity with traditional craftsmanship.',
        country: 'Italy',
        foundedYear: 1921,
        logo: 'G',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Louis Vuitton',
        slug: 'louis-vuitton',
        description: 'French fashion house and luxury retail company founded in 1854, known for its iconic monogram and heritage travel trunks.',
        country: 'France',
        foundedYear: 1854,
        logo: 'LV',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Prada',
        slug: 'prada',
        description: 'Italian luxury fashion house specializing in leather handbags, travel accessories, shoes, ready-to-wear, and perfumes.',
        country: 'Italy',
        foundedYear: 1913,
        logo: 'P',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Hermès',
        slug: 'hermes',
        description: 'French high fashion luxury goods manufacturer established in 1837, specializing in leather, lifestyle accessories, and perfumery.',
        country: 'France',
        foundedYear: 1837,
        logo: 'H',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Chanel',
        slug: 'chanel',
        description: 'French luxury fashion house founded by Coco Chanel, known for its timeless elegance and iconic tweed designs.',
        country: 'France',
        foundedYear: 1910,
        logo: 'C',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Dior',
        slug: 'dior',
        description: 'French luxury goods company founded in 1946, known for its haute couture, ready-to-wear, and leather goods.',
        country: 'France',
        foundedYear: 1946,
        logo: 'D',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Balenciaga',
        slug: 'balenciaga',
        description: 'Spanish luxury fashion house known for its avant-garde designs and architectural silhouettes.',
        country: 'Spain',
        foundedYear: 1919,
        logo: 'B',
      },
    }),
    prisma.brand.create({
      data: {
        name: 'Versace',
        slug: 'versace',
        description: 'Italian luxury fashion company known for its bold prints and glamorous designs.',
        country: 'Italy',
        foundedYear: 1978,
        logo: 'V',
      },
    }),
  ]);

  // Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Shoes',
        slug: 'shoes',
        description: 'Luxury footwear from the world\'s finest fashion houses',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bags',
        slug: 'bags',
        description: 'Iconic handbags and luggage from prestigious luxury brands',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Belts',
        slug: 'belts',
        description: 'Premium leather belts crafted with exceptional attention to detail',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Wallets',
        slug: 'wallets',
        description: 'Fine leather wallets and cardholders from luxury ateliers',
        order: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Luxury accessories including scarves, sunglasses, and jewelry',
        order: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Ready-to-Wear',
        slug: 'ready-to-wear',
        description: 'Luxury clothing collections from the world\'s top designers',
        order: 6,
      },
    }),
  ]);

  // SubCategories
  const subCategories = await Promise.all([
    // Shoes subcategories
    prisma.subCategory.create({ data: { name: 'Sneakers', slug: 'sneakers', categoryId: categories[0].id } }),
    prisma.subCategory.create({ data: { name: 'Loafers', slug: 'loafers', categoryId: categories[0].id } }),
    prisma.subCategory.create({ data: { name: 'Boots', slug: 'boots', categoryId: categories[0].id } }),
    prisma.subCategory.create({ data: { name: 'Heels', slug: 'heels', categoryId: categories[0].id } }),
    prisma.subCategory.create({ data: { name: 'Sandals', slug: 'sandals', categoryId: categories[0].id } }),
    // Bags subcategories
    prisma.subCategory.create({ data: { name: 'Tote Bags', slug: 'tote-bags', categoryId: categories[1].id } }),
    prisma.subCategory.create({ data: { name: 'Crossbody Bags', slug: 'crossbody-bags', categoryId: categories[1].id } }),
    prisma.subCategory.create({ data: { name: 'Clutches', slug: 'clutches', categoryId: categories[1].id } }),
    prisma.subCategory.create({ data: { name: 'Backpacks', slug: 'backpacks', categoryId: categories[1].id } }),
    // Wallets subcategories
    prisma.subCategory.create({ data: { name: 'Cardholders', slug: 'cardholders', categoryId: categories[3].id } }),
    prisma.subCategory.create({ data: { name: 'Bifold Wallets', slug: 'bifold-wallets', categoryId: categories[3].id } }),
    prisma.subCategory.create({ data: { name: 'Long Wallets', slug: 'long-wallets', categoryId: categories[3].id } }),
    // Accessories subcategories
    prisma.subCategory.create({ data: { name: 'Scarves', slug: 'scarves', categoryId: categories[4].id } }),
    prisma.subCategory.create({ data: { name: 'Sunglasses', slug: 'sunglasses', categoryId: categories[4].id } }),
    prisma.subCategory.create({ data: { name: 'Jewelry', slug: 'jewelry', categoryId: categories[4].id } }),
    prisma.subCategory.create({ data: { name: 'Watches', slug: 'watches', categoryId: categories[4].id } }),
    // Ready-to-Wear subcategories
    prisma.subCategory.create({ data: { name: 'Jackets', slug: 'jackets', categoryId: categories[5].id } }),
    prisma.subCategory.create({ data: { name: 'Dresses', slug: 'dresses', categoryId: categories[5].id } }),
    prisma.subCategory.create({ data: { name: 'Shirts', slug: 'shirts', categoryId: categories[5].id } }),
  ]);

  // Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: 'New Arrival', slug: 'new-arrival' } }),
    prisma.tag.create({ data: { name: 'Bestseller', slug: 'bestseller' } }),
    prisma.tag.create({ data: { name: 'Limited Edition', slug: 'limited-edition' } }),
    prisma.tag.create({ data: { name: 'Classic', slug: 'classic' } }),
    prisma.tag.create({ data: { name: 'Signature', slug: 'signature' } }),
    prisma.tag.create({ data: { name: 'Monogram', slug: 'monogram' } }),
    prisma.tag.create({ data: { name: 'Leather', slug: 'leather' } }),
    prisma.tag.create({ data: { name: 'Handmade', slug: 'handmade' } }),
    prisma.tag.create({ data: { name: 'Exclusive', slug: 'exclusive' } }),
    prisma.tag.create({ data: { name: 'Unisex', slug: 'unisex' } }),
  ]);

  // Products
  const products = [
    // Gucci Products
    {
      name: 'Gucci Horsebit 1955 Loafer',
      slug: 'gucci-horsebit-1955-loafer',
      description: 'The iconic Horsebit 1955 loafer is reimagined in smooth black leather. First introduced in 1955, the refined hardware detail on the upper is a testament to the House\'s rich equestrian heritage. This timeless silhouette continues to define elegance with its sleek profile and impeccable Italian craftsmanship.',
      price: 980,
      compareAtPrice: null,
      brandId: brands[0].id,
      categoryId: categories[0].id,
      subCategoryId: subCategories[1].id,
      featured: true,
      bestseller: true,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800","https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800","https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800"]',
      variants: [
        { name: 'Black / 40', color: 'Black', size: '40', price: 980, stock: 5 },
        { name: 'Black / 41', color: 'Black', size: '41', price: 980, stock: 3 },
        { name: 'Black / 42', color: 'Black', size: '42', price: 980, stock: 7 },
        { name: 'Brown / 40', color: 'Brown', size: '40', price: 980, stock: 2 },
        { name: 'Brown / 41', color: 'Brown', size: '41', price: 980, stock: 4 },
      ],
      attributes: [
        { name: 'Material', value: 'Smooth calfskin leather' },
        { name: 'Sole', value: 'Leather sole with rubber heel' },
        { name: 'Origin', value: 'Made in Italy' },
        { name: 'Style', value: 'Slip-on loafer' },
      ],
      tags: ['Classic', 'Signature', 'Handmade'],
    },
    {
      name: 'Gucci Marmont Mini Bag',
      slug: 'gucci-marmont-mini-bag',
      description: 'The Marmont Mini bag is crafted from soft matelassé chevron leather and features the iconic Double G hardware. With its compact silhouette and versatile chain strap that can be worn doubled or as a single long strap, this bag seamlessly transitions from day to evening.',
      price: 2450,
      compareAtPrice: 2890,
      brandId: brands[0].id,
      categoryId: categories[1].id,
      subCategoryId: subCategories[6].id,
      featured: true,
      bestseller: true,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800","https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800"]',
      variants: [
        { name: 'Black', color: 'Black', price: 2450, stock: 3 },
        { name: 'Beige', color: 'Beige', price: 2450, stock: 5 },
        { name: 'Pink', color: 'Pink', price: 2600, stock: 2 },
      ],
      attributes: [
        { name: 'Material', value: 'Matelassé chevron leather' },
        { name: 'Hardware', value: 'Antiqued gold-tone Double G' },
        { name: 'Dimensions', value: 'W23cm × H14cm × D6cm' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['Bestseller', 'Signature', 'Leather'],
    },
    {
      name: 'Gucci GG Supreme Belt',
      slug: 'gucci-gg-supreme-belt',
      description: 'A defining piece from the House\'s collection, this belt features the iconic GG Supreme canvas—a material introduced in the 1970s—paired with the Interlocking G buckle. The combination of the legendary monogram pattern and refined hardware creates an unmistakably Gucci accessory.',
      price: 490,
      compareAtPrice: null,
      brandId: brands[0].id,
      categoryId: categories[2].id,
      subCategoryId: null,
      featured: false,
      bestseller: true,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1637888368690-4a669a5532e9?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
      variants: [
        { name: '85cm', size: '85cm', price: 490, stock: 10 },
        { name: '90cm', size: '90cm', price: 490, stock: 8 },
        { name: '95cm', size: '95cm', price: 490, stock: 6 },
        { name: '100cm', size: '100cm', price: 490, stock: 4 },
      ],
      attributes: [
        { name: 'Material', value: 'GG Supreme canvas with leather trim' },
        { name: 'Buckle', value: 'Antiqued silver-tone Interlocking G' },
        { name: 'Width', value: '3.5cm' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['Classic', 'Monogram', 'Unisex'],
    },
    {
      name: 'Gucci Dionysus GG Supreme Sneaker',
      slug: 'gucci-dionysus-sneaker',
      description: 'The Dionysus sneaker merges the iconic GG Supreme pattern with modern streetwear sensibility. Featuring a chunky rubber sole and the House\'s recognizable bee motif, this sneaker bridges the gap between heritage luxury and contemporary fashion.',
      price: 890,
      compareAtPrice: null,
      brandId: brands[0].id,
      categoryId: categories[0].id,
      subCategoryId: subCategories[0].id,
      featured: true,
      bestseller: false,
      newArrival: true,
      images: '["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800","https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800"]',
      variants: [
        { name: 'White/GG / 40', color: 'White/GG', size: '40', price: 890, stock: 4 },
        { name: 'White/GG / 42', color: 'White/GG', size: '42', price: 890, stock: 3 },
        { name: 'White/GG / 44', color: 'White/GG', size: '44', price: 890, stock: 2 },
        { name: 'Black/GG / 41', color: 'Black/GG', size: '41', price: 890, stock: 5 },
        { name: 'Black/GG / 43', color: 'Black/GG', size: '43', price: 890, stock: 3 },
      ],
      attributes: [
        { name: 'Material', value: 'GG Supreme canvas with leather details' },
        { name: 'Sole', value: 'Rubber chunky sole' },
        { name: 'Details', value: 'Bee motif embroidery' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['New Arrival', 'Monogram', 'Unisex'],
    },
    {
      name: 'Gucci Ophidia Wallet',
      slug: 'gucci-ophidia-wallet',
      description: 'Part of the Ophidia line, this bi-fold wallet showcases the House\'s rich heritage through the combination of the iconic GG Supreme canvas and the classic Diamante pattern. The sleek design includes multiple card slots and a bill compartment for everyday practicality.',
      price: 520,
      compareAtPrice: null,
      brandId: brands[0].id,
      categoryId: categories[3].id,
      subCategoryId: subCategories[9].id,
      featured: false,
      bestseller: false,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800","https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800"]',
      variants: [
        { name: 'Beige/Brown', color: 'Beige/Brown', price: 520, stock: 6 },
        { name: 'Black', color: 'Black', price: 520, stock: 8 },
      ],
      attributes: [
        { name: 'Material', value: 'GG Supreme canvas with suede trim' },
        { name: 'Closure', value: 'Zip-top closure' },
        { name: 'Card Slots', value: '12 card slots, 3 bill compartments' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['Classic', 'Monogram', 'Leather'],
    },

    // Louis Vuitton Products
    {
      name: 'Louis Vuitton Neverfull MM',
      slug: 'louis-vuitton-neverfull-mm',
      description: 'The Neverfull MM is one of Louis Vuitton\'s most iconic bags, combining timeless elegance with everyday functionality. Crafted from the legendary Monogram canvas with natural cowhide trim, it features generous interior space with a secure zip closure. The side laces allow the bag\'s shape to be adjusted for everyday needs.',
      price: 1790,
      compareAtPrice: null,
      brandId: brands[1].id,
      categoryId: categories[1].id,
      subCategoryId: subCategories[5].id,
      featured: true,
      bestseller: true,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800","https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800"]',
      variants: [
        { name: 'Monogram', color: 'Monogram', price: 1790, stock: 5 },
        { name: 'Damier Ebene', color: 'Damier Ebene', price: 1790, stock: 4 },
        { name: 'Monogram Reverse', color: 'Monogram Reverse', price: 1850, stock: 3 },
      ],
      attributes: [
        { name: 'Material', value: 'Monogram canvas with natural cowhide trim' },
        { name: 'Hardware', value: 'Gold-color metallic pieces' },
        { name: 'Dimensions', value: 'W32cm × H29cm × D17cm' },
        { name: 'Origin', value: 'Made in France' },
      ],
      tags: ['Bestseller', 'Classic', 'Monogram'],
    },
    {
      name: 'Louis Vuitton Speedy Bandoulière 25',
      slug: 'louis-vuitton-speedy-25',
      description: 'Reinvented with a removable strap and zipper, the Speedy Bandoulière 25 is both modern and practical. The iconic silhouette in Monogram canvas is instantly recognizable, while the new features bring fresh functionality to this timeless design.',
      price: 1360,
      compareAtPrice: 1520,
      brandId: brands[1].id,
      categoryId: categories[1].id,
      subCategoryId: subCategories[6].id,
      featured: true,
      bestseller: true,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800"]',
      variants: [
        { name: 'Monogram', color: 'Monogram', price: 1360, stock: 6 },
        { name: 'Damier Azur', color: 'Damier Azur', price: 1360, stock: 4 },
        { name: 'Black Monogram', color: 'Black Monogram', price: 1420, stock: 2 },
      ],
      attributes: [
        { name: 'Material', value: 'Monogram canvas with natural cowhide trim' },
        { name: 'Hardware', value: 'Gold-color metallic pieces' },
        { name: 'Dimensions', value: 'W25cm × H19cm × D13cm' },
        { name: 'Strap', value: 'Removable, adjustable strap' },
      ],
      tags: ['Bestseller', 'Classic', 'Monogram'],
    },
    {
      name: 'Louis Vuitton Run Away Sneaker',
      slug: 'louis-vuitton-run-away-sneaker',
      description: 'The Run Away sneaker combines the Maison\'s heritage with a contemporary chunky silhouette. Crafted from premium technical fabric and adorned with the iconic LV Initials, it features an extra-thick rubber sole with a Max cushion for all-day comfort.',
      price: 1150,
      compareAtPrice: null,
      brandId: brands[1].id,
      categoryId: categories[0].id,
      subCategoryId: subCategories[0].id,
      featured: false,
      bestseller: false,
      newArrival: true,
      images: '["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800","https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800"]',
      variants: [
        { name: 'White/Black / 41', color: 'White/Black', size: '41', price: 1150, stock: 3 },
        { name: 'White/Black / 42', color: 'White/Black', size: '42', price: 1150, stock: 2 },
        { name: 'White/Black / 43', color: 'White/Black', size: '43', price: 1150, stock: 4 },
        { name: 'White/Blue / 42', color: 'White/Blue', size: '42', price: 1150, stock: 2 },
      ],
      attributes: [
        { name: 'Material', value: 'Technical fabric with calfskin leather trim' },
        { name: 'Sole', value: 'Rubber with Max cushion technology' },
        { name: 'Details', value: 'LV Initials on tongue and side' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['New Arrival', 'Unisex'],
    },
    {
      name: 'Louis Vuitton_favorite-MM',
      slug: 'louis-vuitton-favorite-mm-belt',
      description: 'The LV Favorite MM belt combines the iconic LV Initials buckle with a refined calfskin leather strap. Its reversible design offers two distinct looks in one accessory, making it a versatile addition to any luxury wardrobe.',
      price: 680,
      compareAtPrice: null,
      brandId: brands[1].id,
      categoryId: categories[2].id,
      subCategoryId: null,
      featured: false,
      bestseller: false,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1637888368690-4a669a5532e9?w=800"]',
      variants: [
        { name: 'Noir / 80cm', color: 'Black', size: '80cm', price: 680, stock: 5 },
        { name: 'Noir / 85cm', color: 'Black', size: '85cm', price: 680, stock: 7 },
        { name: 'Noir / 90cm', color: 'Black', size: '90cm', price: 680, stock: 4 },
      ],
      attributes: [
        { name: 'Material', value: 'Calfskin leather, reversible' },
        { name: 'Buckle', value: 'Louis Vuitton Initials, gold-color' },
        { name: 'Width', value: '4cm' },
        { name: 'Origin', value: 'Made in France' },
      ],
      tags: ['Classic', 'Signature', 'Leather'],
    },

    // Prada Products
    {
      name: 'Prada Re-Nylon Shoulder Bag',
      slug: 'prada-re-nylon-shoulder-bag',
      description: 'Crafted from Re-Nylon—a sustainable fabric regenerated from ocean plastic—this shoulder bag embodies Prada\'s commitment to conscious luxury. The signature triangular plaque adorns the front, while the adjustable strap offers versatile carrying options.',
      price: 1350,
      compareAtPrice: null,
      brandId: brands[2].id,
      categoryId: categories[1].id,
      subCategoryId: subCategories[6].id,
      featured: true,
      bestseller: false,
      newArrival: true,
      images: '["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800","https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800"]',
      variants: [
        { name: 'Black', color: 'Black', price: 1350, stock: 4 },
        { name: 'Navy', color: 'Navy', price: 1350, stock: 3 },
        { name: 'Green', color: 'Green', price: 1350, stock: 2 },
      ],
      attributes: [
        { name: 'Material', value: 'Re-Nylon regenerated fabric' },
        { name: 'Hardware', value: 'Saffiano leather triangle plaque' },
        { name: 'Dimensions', value: 'W25cm × H18cm × D10cm' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['New Arrival', 'Exclusive'],
    },
    {
      name: 'Prada Chocolate Brown Leather Loafers',
      slug: 'prada-chocolate-brown-leather-loafers',
      description: 'These Prada loafers exemplify understated luxury with their smooth chocolate brown leather construction and sleek silhouette. The refined penny strap detail and stacked leather heel add a touch of sophistication to any ensemble.',
      price: 790,
      compareAtPrice: null,
      brandId: brands[2].id,
      categoryId: categories[0].id,
      subCategoryId: subCategories[1].id,
      featured: false,
      bestseller: true,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800","https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800"]',
      variants: [
        { name: 'Brown / 40', color: 'Brown', size: '40', price: 790, stock: 5 },
        { name: 'Brown / 41', color: 'Brown', size: '41', price: 790, stock: 3 },
        { name: 'Brown / 42', color: 'Brown', size: '42', price: 790, stock: 6 },
        { name: 'Black / 41', color: 'Black', size: '41', price: 790, stock: 4 },
      ],
      attributes: [
        { name: 'Material', value: 'Full-grain calfskin leather' },
        { name: 'Sole', value: 'Leather sole with stacked heel' },
        { name: 'Details', value: 'Penny strap with metal detail' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['Classic', 'Handmade', 'Leather'],
    },
    {
      name: 'Prada Saffiano Leather Wallet',
      slug: 'prada-saffiano-leather-wallet',
      description: 'Crafted from Prada\'s signature Saffiano leather, this bifold wallet combines durability with refined elegance. The distinctive cross-hatch texture and clean lines showcase the brand\'s minimalist aesthetic, while the interior offers ample storage.',
      price: 450,
      compareAtPrice: null,
      brandId: brands[2].id,
      categoryId: categories[3].id,
      subCategoryId: subCategories[9].id,
      featured: false,
      bestseller: false,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800","https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800"]',
      variants: [
        { name: 'Black', color: 'Black', price: 450, stock: 8 },
        { name: 'Navy', color: 'Navy', price: 450, stock: 5 },
        { name: 'Bordeaux', color: 'Bordeaux', price: 450, stock: 3 },
      ],
      attributes: [
        { name: 'Material', value: 'Saffiano leather' },
        { name: 'Closure', value: 'Snap closure' },
        { name: 'Card Slots', value: '8 card slots, 2 bill compartments' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['Classic', 'Leather', 'Handmade'],
    },

    // Hermès Products
    {
      name: 'Hermès Birkin 30 Togo',
      slug: 'hermes-birkin-30-togo',
      description: 'The Birkin 30 in Togo leather represents the pinnacle of luxury craftsmanship. Hand-stitched by a single artisan using the traditional saddle-stitch technique, each bag requires approximately 18 hours of meticulous work. The Togo leather—known for its fine grain and natural pebbled texture—develops a beautiful patina over time.',
      price: 12500,
      compareAtPrice: null,
      brandId: brands[3].id,
      categoryId: categories[1].id,
      subCategoryId: subCategories[5].id,
      featured: true,
      bestseller: true,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800","https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800"]',
      variants: [
        { name: 'Gold', color: 'Gold', price: 12500, stock: 1 },
        { name: 'Noir', color: 'Black', price: 12500, stock: 1 },
        { name: 'Etoupe', color: 'Etoupe', price: 12800, stock: 1 },
      ],
      attributes: [
        { name: 'Material', value: 'Togo calfskin leather' },
        { name: 'Hardware', value: 'Palladium gold hardware' },
        { name: 'Dimensions', value: 'W30cm × H25cm × D16cm' },
        { name: 'Craftsmanship', value: 'Hand-stitched saddle stitch' },
        { name: 'Origin', value: 'Made in France' },
      ],
      tags: ['Bestseller', 'Handmade', 'Exclusive', 'Limited Edition'],
    },
    {
      name: 'Hermès Clic H Belt',
      slug: 'hermes-clic-h-belt',
      description: 'The iconic Clic H belt features the unmistakable H-shaped buckle in brushed metal, paired with Swift calfskin leather. This legendary accessory has been a symbol of understated luxury since its introduction and remains one of Hermès\' most coveted pieces.',
      price: 790,
      compareAtPrice: null,
      brandId: brands[3].id,
      categoryId: categories[2].id,
      subCategoryId: null,
      featured: false,
      bestseller: true,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1637888368690-4a669a5532e9?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
      variants: [
        { name: 'Gold/Black / 80', color: 'Black', size: '80cm', price: 790, stock: 3 },
        { name: 'Gold/Black / 85', color: 'Black', size: '85cm', price: 790, stock: 4 },
        { name: 'Gold/Etoupe / 85', color: 'Etoupe', size: '85cm', price: 790, stock: 2 },
        { name: 'Gold/Orange / 90', color: 'Orange', size: '90cm', price: 790, stock: 2 },
      ],
      attributes: [
        { name: 'Material', value: 'Swift calfskin leather' },
        { name: 'Buckle', value: 'Brushed metal H buckle' },
        { name: 'Width', value: '3.2cm' },
        { name: 'Origin', value: 'Made in France' },
      ],
      tags: ['Classic', 'Signature', 'Leather', 'Handmade'],
    },
    {
      name: 'Hermès Kelly Long Wallet',
      slug: 'hermes-kelly-long-wallet',
      description: 'Inspired by the iconic Kelly bag, this long wallet features the same distinctive strap closure with a turn-lock. Crafted from Epsom leather with box calfskin trim, it includes multiple card slots and compartments for exceptional organization.',
      price: 2450,
      compareAtPrice: null,
      brandId: brands[3].id,
      categoryId: categories[3].id,
      subCategoryId: subCategories[11].id,
      featured: false,
      bestseller: false,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800","https://images.unsplash.com/photo-1627123424574-724758594e93?w=800"]',
      variants: [
        { name: 'Gold', color: 'Gold', price: 2450, stock: 2 },
        { name: 'Noir', color: 'Black', price: 2450, stock: 3 },
        { name: 'Rose Sakura', color: 'Rose Sakura', price: 2450, stock: 1 },
      ],
      attributes: [
        { name: 'Material', value: 'Epsom calfskin leather with box calfskin trim' },
        { name: 'Closure', value: 'Kelly strap with turn-lock' },
        { name: 'Card Slots', value: '12 card slots, 4 compartments' },
        { name: 'Origin', value: 'Made in France' },
      ],
      tags: ['Classic', 'Signature', 'Handmade', 'Leather'],
    },

    // Chanel Products
    {
      name: 'Chanel Classic Flap Medium',
      slug: 'chanel-classic-flap-medium',
      description: 'The quintessential Classic Flap bag from Chanel features the iconic diamond-quilted lambskin leather, a woven chain and leather strap, and the signature CC turn-lock closure. First designed by Coco Chanel in February 1955—hence its name "2.55"—this bag has become a timeless symbol of elegance and sophistication.',
      price: 10800,
      compareAtPrice: null,
      brandId: brands[4].id,
      categoryId: categories[1].id,
      subCategoryId: subCategories[6].id,
      featured: true,
      bestseller: true,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800","https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800"]',
      variants: [
        { name: 'Black Caviar', color: 'Black', material: 'Caviar leather', price: 10800, stock: 1 },
        { name: 'Black Lambskin', color: 'Black', material: 'Lambskin leather', price: 10500, stock: 2 },
        { name: 'Beige Lambskin', color: 'Beige', material: 'Lambskin leather', price: 10500, stock: 1 },
      ],
      attributes: [
        { name: 'Material', value: 'Lambskin or Caviar leather' },
        { name: 'Hardware', value: 'Gold-tone or silver-tone CC' },
        { name: 'Dimensions', value: 'W25cm × H16cm × D7cm' },
        { name: 'Strap', value: 'Woven chain and leather, double strap' },
        { name: 'Origin', value: 'Made in France' },
      ],
      tags: ['Bestseller', 'Classic', 'Signature', 'Exclusive'],
    },
    {
      name: 'Chanel Slingback Pumps',
      slug: 'chanel-slingback-pumps',
      description: 'The iconic Chanel slingback pump has been reimagined for the modern woman while retaining its classic elegance. The signature two-tone design with the beige toe creates the illusion of longer legs, while the adjustable ankle strap ensures a perfect fit.',
      price: 950,
      compareAtPrice: null,
      brandId: brands[4].id,
      categoryId: categories[0].id,
      subCategoryId: subCategories[3].id,
      featured: false,
      bestseller: true,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800","https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800"]',
      variants: [
        { name: 'Beige/Black / 37', color: 'Beige/Black', size: '37', price: 950, stock: 3 },
        { name: 'Beige/Black / 38', color: 'Beige/Black', size: '38', price: 950, stock: 4 },
        { name: 'Beige/Black / 39', color: 'Beige/Black', size: '39', price: 950, stock: 2 },
        { name: 'All Black / 38', color: 'Black', size: '38', price: 950, stock: 3 },
      ],
      attributes: [
        { name: 'Material', value: 'Calfskin leather' },
        { name: 'Heel', value: '7.5cm covered heel' },
        { name: 'Details', value: 'Two-tone design, adjustable strap' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['Classic', 'Signature', 'Handmade'],
    },
    {
      name: 'Chanel Wallet on Chain',
      slug: 'chanel-wallet-on-chain',
      description: 'The Wallet on Chain (WOC) is one of Chanel\'s most versatile accessories. Featuring the iconic quilted lambskin leather, signature CC turn-lock, and a long chain strap, it can be worn as a crossbody bag during the day or as an evening clutch.',
      price: 3900,
      compareAtPrice: null,
      brandId: brands[4].id,
      categoryId: categories[1].id,
      subCategoryId: subCategories[7].id,
      featured: true,
      bestseller: true,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800","https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800"]',
      variants: [
        { name: 'Black Caviar', color: 'Black', price: 3900, stock: 3 },
        { name: 'Black Lambskin', color: 'Black', price: 3800, stock: 2 },
        { name: 'Pink Caviar', color: 'Pink', price: 3900, stock: 1 },
      ],
      attributes: [
        { name: 'Material', value: 'Quilted caviar or lambskin leather' },
        { name: 'Chain', value: 'Gold-tone or silver-tone chain and leather' },
        { name: 'Dimensions', value: 'W19cm × H12cm × D3cm' },
        { name: 'Origin', value: 'Made in France' },
      ],
      tags: ['Bestseller', 'Classic', 'Signature'],
    },

    // Dior Products
    {
      name: 'Dior Book Tote',
      slug: 'dior-book-tote',
      description: 'The Dior Book Tote has become a modern icon since its debut. Crafted from the signature Dior Oblique canvas, this spacious tote features an ergonomic design with two top handles and a wide opening, making it the perfect companion for both travel and everyday luxury.',
      price: 3200,
      compareAtPrice: null,
      brandId: brands[5].id,
      categoryId: categories[1].id,
      subCategoryId: subCategories[5].id,
      featured: true,
      bestseller: false,
      newArrival: true,
      images: '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800","https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800"]',
      variants: [
        { name: 'Blue Oblique', color: 'Blue Oblique', price: 3200, stock: 3 },
        { name: 'Black Oblique', color: 'Black', price: 3200, stock: 4 },
        { name: 'Beige Oblique', color: 'Beige', price: 3200, stock: 2 },
      ],
      attributes: [
        { name: 'Material', value: 'Dior Oblique embroidered canvas' },
        { name: 'Trim', value: 'Calfskin leather' },
        { name: 'Dimensions', value: 'W40cm × H30cm × D17cm' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['New Arrival', 'Monogram', 'Unisex'],
    },
    {
      name: 'Dior Walk\'n\'Dior Sneaker',
      slug: 'dior-walkn-dior-sneaker',
      description: 'The Walk\'n\'Dior sneaker reimagines the classic Dior Oblique motif in a low-top sneaker silhouette. Combining luxurious materials with athletic influences, it features the signature CD initials on the tongue and a rubber sole with an embossed Dior pattern.',
      price: 990,
      compareAtPrice: null,
      brandId: brands[5].id,
      categoryId: categories[0].id,
      subCategoryId: subCategories[0].id,
      featured: false,
      bestseller: false,
      newArrival: true,
      images: '["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800","https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800"]',
      variants: [
        { name: 'White/Blue / 41', color: 'White/Blue', size: '41', price: 990, stock: 4 },
        { name: 'White/Blue / 42', color: 'White/Blue', size: '42', price: 990, stock: 3 },
        { name: 'White/Blue / 43', color: 'White/Blue', size: '43', price: 990, stock: 2 },
        { name: 'White/Black / 42', color: 'White/Black', size: '42', price: 990, stock: 3 },
      ],
      attributes: [
        { name: 'Material', value: 'Smooth calfskin leather and Dior Oblique canvas' },
        { name: 'Sole', value: 'Rubber sole with Dior embossing' },
        { name: 'Details', value: 'CD initials on tongue' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['New Arrival', 'Monogram', 'Unisex'],
    },
    {
      name: 'Dior 30 Montaigne Belt',
      slug: 'dior-30-montaigne-belt',
      description: 'The 30 Montaigne belt pays homage to the historic address of Christian Dior\'s couture house. Featuring the signature CD buckle in a refined gold or silver finish, it is crafted from smooth calfskin leather for a sophisticated and contemporary look.',
      price: 650,
      compareAtPrice: null,
      brandId: brands[5].id,
      categoryId: categories[2].id,
      subCategoryId: null,
      featured: false,
      bestseller: false,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1637888368690-4a669a5532e9?w=800","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"]',
      variants: [
        { name: 'Black/Gold / 85', color: 'Black', size: '85cm', price: 650, stock: 5 },
        { name: 'Black/Gold / 90', color: 'Black', size: '90cm', price: 650, stock: 4 },
        { name: 'Brown/Gold / 85', color: 'Brown', size: '85cm', price: 650, stock: 3 },
      ],
      attributes: [
        { name: 'Material', value: 'Smooth calfskin leather' },
        { name: 'Buckle', value: 'CD initials, gold or silver-tone' },
        { name: 'Width', value: '4cm' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['Signature', 'Leather'],
    },

    // Balenciaga Products
    {
      name: 'Balenciaga Track Sneaker',
      slug: 'balenciaga-track-sneaker',
      description: 'The Track sneaker is a technical masterpiece from Balenciaga, featuring a complex multi-panel construction with 96 different components. This chunky runner silhouette combines performance-inspired design elements with luxury materials, creating one of the most distinctive sneakers in contemporary fashion.',
      price: 1090,
      compareAtPrice: null,
      brandId: brands[6].id,
      categoryId: categories[0].id,
      subCategoryId: subCategories[0].id,
      featured: true,
      bestseller: false,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"]',
      variants: [
        { name: 'Black/White / 42', color: 'Black/White', size: '42', price: 1090, stock: 3 },
        { name: 'Black/White / 43', color: 'Black/White', size: '43', price: 1090, stock: 2 },
        { name: 'Black/White / 44', color: 'Black/White', size: '44', price: 1090, stock: 4 },
        { name: 'Grey/Orange / 43', color: 'Grey/Orange', size: '43', price: 1090, stock: 2 },
      ],
      attributes: [
        { name: 'Material', value: 'Mesh, rubber, and neoprene' },
        { name: 'Sole', value: 'Rubber with 3D effect' },
        { name: 'Details', value: '96 components, embroidered branding' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['Exclusive', 'Unisex'],
    },
    {
      name: 'Balenciaga Hourglass Small Bag',
      slug: 'balenciaga-hourglass-small-bag',
      description: 'The Hourglass bag is a sculptural masterpiece defined by its curved silhouette inspired by the brand\'s archival designs. The signature B closure and soft lambskin leather create a bag that is both a work of art and a functional everyday accessory.',
      price: 2150,
      compareAtPrice: 2400,
      brandId: brands[6].id,
      categoryId: categories[1].id,
      subCategoryId: subCategories[6].id,
      featured: false,
      bestseller: false,
      newArrival: true,
      images: '["https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800","https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800"]',
      variants: [
        { name: 'Black', color: 'Black', price: 2150, stock: 3 },
        { name: 'White', color: 'White', price: 2150, stock: 2 },
        { name: 'Red', color: 'Red', price: 2150, stock: 1 },
      ],
      attributes: [
        { name: 'Material', value: 'Quilted lambskin leather' },
        { name: 'Closure', value: 'Balenciaga B closure in mirrored metal' },
        { name: 'Dimensions', value: 'W22cm × H16cm × D8cm' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['New Arrival', 'Exclusive', 'Limited Edition'],
    },

    // Versace Products
    {
      name: 'Versace Medusa Biggie Sneaker',
      slug: 'versace-medusa-biggie-sneaker',
      description: 'The Medusa Biggie sneaker combines Versace\'s bold aesthetic with modern streetwear elements. The oversized rubber sole provides exceptional comfort, while the Medusa head detailing and Greek key motifs showcase the brand\'s rich mythology-inspired heritage.',
      price: 895,
      compareAtPrice: null,
      brandId: brands[7].id,
      categoryId: categories[0].id,
      subCategoryId: subCategories[0].id,
      featured: false,
      bestseller: false,
      newArrival: true,
      images: '["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"]',
      variants: [
        { name: 'White/Gold / 41', color: 'White/Gold', size: '41', price: 895, stock: 4 },
        { name: 'White/Gold / 42', color: 'White/Gold', size: '42', price: 895, stock: 3 },
        { name: 'White/Gold / 43', color: 'White/Gold', size: '43', price: 895, stock: 2 },
        { name: 'Black/Gold / 42', color: 'Black/Gold', size: '42', price: 895, stock: 3 },
      ],
      attributes: [
        { name: 'Material', value: 'Leather with Medusa details' },
        { name: 'Sole', value: 'Oversized rubber sole' },
        { name: 'Details', value: 'Medusa head, Greek key motifs' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['New Arrival', 'Signature', 'Unisex'],
    },
    {
      name: 'Versace La Greca Belt',
      slug: 'versace-la-greca-belt',
      description: 'The La Greca belt showcases Versace\'s signature Greek key pattern rendered in premium leather. The bold gold-tone Medusa Palazzo buckle serves as the centerpiece, creating an accessory that embodies the brand\'s glamorous and distinctive aesthetic.',
      price: 575,
      compareAtPrice: null,
      brandId: brands[7].id,
      categoryId: categories[2].id,
      subCategoryId: null,
      featured: false,
      bestseller: false,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800","https://images.unsplash.com/photo-1637888368690-4a669a5532e9?w=800"]',
      variants: [
        { name: 'Black/Gold / 85', color: 'Black', size: '85cm', price: 575, stock: 5 },
        { name: 'Black/Gold / 90', color: 'Black', size: '90cm', price: 575, stock: 4 },
        { name: 'White/Gold / 85', color: 'White', size: '85cm', price: 575, stock: 2 },
      ],
      attributes: [
        { name: 'Material', value: 'Leather with Greek key embossing' },
        { name: 'Buckle', value: 'Medusa Palazzo, gold-tone' },
        { name: 'Width', value: '3.5cm' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['Signature', 'Leather'],
    },
    {
      name: 'Versace Barocco Print Silk Scarf',
      slug: 'versace-barocco-print-silk-scarf',
      description: 'This luxurious silk scarf features the iconic Barocco print, one of Versace\'s most recognizable patterns. The rich colors and intricate Baroque-inspired design make this scarf a statement piece that elevates any outfit with Italian glamour.',
      price: 420,
      compareAtPrice: null,
      brandId: brands[7].id,
      categoryId: categories[4].id,
      subCategoryId: subCategories[12].id,
      featured: false,
      bestseller: false,
      newArrival: false,
      images: '["https://images.unsplash.com/photo-1601924994987-69e26d50dc64?w=800","https://images.unsplash.com/photo-1606503153255-59d8b8b82176?w=800"]',
      variants: [
        { name: 'Multi-color', color: 'Multi-color', price: 420, stock: 6 },
        { name: 'Black/Gold', color: 'Black/Gold', price: 420, stock: 4 },
      ],
      attributes: [
        { name: 'Material', value: '100% silk twill' },
        { name: 'Dimensions', value: '90cm × 90cm' },
        { name: 'Details', value: 'Hand-rolled edges' },
        { name: 'Origin', value: 'Made in Italy' },
      ],
      tags: ['Classic', 'Handmade', 'Exclusive'],
    },
  ];

  // Create products
  for (const productData of products) {
    const { variants, attributes, tags: tagNames, ...productFields } = productData;

    const product = await prisma.product.create({
      data: productFields,
    });

    // Create variants
    for (const variant of variants) {
      await prisma.productVariant.create({
        data: {
          ...variant,
          productId: product.id,
        },
      });
    }

    // Create attributes
    for (const attr of attributes) {
      await prisma.productAttribute.create({
        data: {
          ...attr,
          productId: product.id,
        },
      });
    }

    // Create tags
    for (const tagName of tagNames) {
      const tag = tags.find((t) => t.name === tagName);
      if (tag) {
        await prisma.productTag.create({
          data: {
            productId: product.id,
            tagId: tag.id,
          },
        });
      }
    }
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`   Brands: ${brands.length}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   SubCategories: ${subCategories.length}`);
  console.log(`   Tags: ${tags.length}`);
  console.log(`   Products: ${products.length}`);
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
