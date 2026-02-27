const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const providers = await prisma.provider.findMany({
    select: { slug: true, name: true }
  });
  console.log('Available providers:');
  providers.forEach(p => console.log(`  - ${p.slug} (${p.name})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
