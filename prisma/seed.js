import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log('Seeding Aameena Furniture database...');

  // 1. Create or Find Showroom Branches
  const branchesData = [
    {
      name: 'Grand Showroom Flagship',
      city: 'Mumbai',
      address: 'Plot 42, Woodcrafters Boulevard, Bandra West',
      phone: '+91 98765 00001',
    },
    {
      name: 'South Design Studio',
      city: 'Bengaluru',
      address: '88 Heritage Arcade, Indiranagar',
      phone: '+91 98765 00002',
    },
    {
      name: 'Central Carpentry Workshop',
      city: 'Jodhpur',
      address: '14 Artisan Estate, Industrial Area',
      phone: '+91 98765 00003',
    },
  ];

  for (const b of branchesData) {
    const existing = await prisma.branch.findFirst({ where: { name: b.name } });
    if (!existing) {
      await prisma.branch.create({ data: b });
      console.log(`Created branch: ${b.name}`);
    }
  }

  // 2. Categories
  const categoriesData = [
    { name: 'Living Room', slug: 'living', description: 'Royal teak sofas, coffee tables, and lounger sets.' },
    { name: 'Bedroom', slug: 'bedroom', description: 'Handcrafted king/queen beds, wardrobes, and nightstands.' },
    { name: 'Dining Room', slug: 'dining', description: 'Solid wood 6 & 8-seater dining suites with cushioned chairs.' },
    { name: 'Office & Study', slug: 'office', description: 'Executive mahogany desks, ergonomic teak chairs, and bookshelves.' },
  ];

  const catMap = {};
  for (const cat of categoriesData) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    catMap[cat.slug] = upserted.id;
    console.log(`Category verified: ${cat.name}`);
  }

  // 3. Products
  const productsData = [
    {
      title: 'Royal Teak Wood 7-Seater Sofa Set',
      slug: 'royal-teak-wood-7-seater-sofa-set',
      categorySlug: 'living',
      price: 85000,
      compareAtPrice: 110000,
      costPrice: 48000,
      stock: 14,
      woodType: 'Grade-A Sagwan Teak',
      dimensions: '110L x 84W x 34H inches',
      finishType: 'Natural Teak Honey Polish',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Handcrafted 7-seater royal living sofa with solid Grade-A Sagwan teak structure, water-repellent velvet fabric, and 40D high-resilience foam.',
    },
    {
      title: 'Imperial Handcarved King Bed with Hydraulic Storage',
      slug: 'imperial-handcarved-king-bed',
      categorySlug: 'bedroom',
      price: 62500,
      compareAtPrice: 78000,
      costPrice: 35000,
      stock: 8,
      woodType: 'Solid Sheesham Hardwood',
      dimensions: '78L x 72W x 48H inches',
      finishType: 'Warm Walnut Satin Matte',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Heavy solid Sheesham king-size bed with seamless hydraulic storage box, acoustic foam cushioned headboard, and 10-year anti-termite guarantee.',
    },
    {
      title: 'Monarch 6-Seater Teak Dining Table Suite',
      slug: 'monarch-6-seater-teak-dining-suite',
      categorySlug: 'dining',
      price: 54000,
      compareAtPrice: 68000,
      costPrice: 31000,
      stock: 12,
      woodType: 'Grade-A Sagwan Teak',
      dimensions: '72L x 36W x 30H inches',
      finishType: 'Natural Teak Melamine Gloss',
      isFeatured: true,
      images: [
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
      ],
      description: '6-seater dining table crafted from single-slab look seasoned teak wood, accompanied by 6 ergonomically curved high-back wooden chairs.',
    },
    {
      title: 'Heritage Wooden 4-Door Wardrobe with Locker',
      slug: 'heritage-wooden-4-door-wardrobe',
      categorySlug: 'bedroom',
      price: 48900,
      compareAtPrice: 59000,
      costPrice: 28000,
      stock: 6,
      woodType: 'Solid Sheesham Hardwood',
      dimensions: '80L x 24W x 78H inches',
      finishType: 'Mahogany Warm Satin',
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Spacious 4-door wardrobe featuring internal digital locker compartment, full-length bevelled mirror, and deep hanging space.',
    },
    {
      title: 'Executive Teak Study Desk with Drawers',
      slug: 'executive-teak-study-desk',
      categorySlug: 'office',
      price: 32000,
      compareAtPrice: 42000,
      costPrice: 18000,
      stock: 9,
      woodType: 'Grade-A Sagwan Teak',
      dimensions: '60L x 30W x 30H inches',
      finishType: 'Dark Walnut Espresso',
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Heavy solid wood office workstation with cable management grommets, brass handles, and soft-closing drawer glides.',
    },
    {
      title: 'Contemporary Center Coffee Table with Concealed Storage',
      slug: 'contemporary-center-coffee-table',
      categorySlug: 'living',
      price: 18500,
      compareAtPrice: 24000,
      costPrice: 9500,
      stock: 15,
      woodType: 'Grade-A Sagwan Teak',
      dimensions: '48L x 24W x 18H inches',
      finishType: 'Natural Teak Matte',
      isFeatured: false,
      images: [
        'https://images.unsplash.com/photo-1533779283484-8da696530a65?auto=format&fit=crop&w=800&q=80',
      ],
      description: 'Minimalist coffee table with toughened glass top insert and dual concealed pull-out storage drawers for living spaces.',
    },
  ];

  for (const prod of productsData) {
    const { categorySlug, ...data } = prod;
    const catId = catMap[categorySlug];
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: { ...data, categoryId: catId },
      create: { ...data, categoryId: catId },
    });
    console.log(`Product verified: ${data.title}`);
  }

  // 4. Sample Service Inquiries
  const sampleInquiry = await prisma.serviceInquiry.create({
    data: {
      clientName: 'Rajesh Singhania',
      clientPhone: '+91 98200 12345',
      clientEmail: 'rajesh.singhania@gmail.com',
      serviceType: 'Bespoke Custom Furniture Crafting',
      woodChoice: 'Grade-A Sagwan Teak',
      dimensions: 'Living Room 24ft x 16ft - L-Shape 8 Seater',
      roomType: 'Living Room',
      estimatedCost: 145000,
      notes: 'Wants dark walnut finish with beige velvet upholstery. On-site measurement requested for Sunday.',
      status: 'PENDING',
    },
  });
  console.log(`Sample Service Inquiry created: ID ${sampleInquiry.id}`);

  // 5. Sample Order
  const sampleOrder = await prisma.order.upsert({
    where: { orderNumber: 'AF-2026-001' },
    update: { productionStage: 'CARVING_JOINERY', status: 'IN_PRODUCTION' },
    create: {
      orderNumber: 'AF-2026-001',
      customerName: 'Priya Verma',
      customerEmail: 'priya.verma@outlook.com',
      customerPhone: '+91 99887 66554',
      shippingAddress: '401 Palm Heights, Worli Sea Face',
      city: 'Mumbai',
      postalCode: '400018',
      totalAmount: 85000,
      status: 'IN_PRODUCTION',
      productionStage: 'CARVING_JOINERY',
      trackingNumber: 'TRK-AF-001-MUM',
      customerNotes: 'Custom carving on sofa arms with royal crest.',
    },
  });
  console.log(`Sample Order verified: ${sampleOrder.orderNumber}`);

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
