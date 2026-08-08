import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: { name: 'Demo Tenant' },
    create: {
      externalCustomerId: 'demo',
      slug: 'demo',
      name: 'Demo Tenant',
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'admin@crm.com', tenantId: demoTenant.id },
        { externalUserId: 'local_demo_admin' },
      ],
    },
  });

  const admin = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: {
          email: 'admin@crm.com',
          passwordHash,
          name: 'Admin',
          authProvider: 'local',
          externalUserId: 'local_demo_admin',
          tenantId: demoTenant.id,
        },
      })
    : await prisma.user.create({
        data: {
          email: 'admin@crm.com',
          passwordHash,
          name: 'Admin',
          authProvider: 'local',
          externalUserId: 'local_demo_admin',
          tenantId: demoTenant.id,
        },
      });

  const existingCompany = await prisma.company.findFirst({
    where: { tenantId: demoTenant.id, ownerId: admin.id },
  });

  if (!existingCompany) {
    await prisma.company.create({
      data: {
        name: 'Demo Company',
        ownerId: admin.id,
        tenantId: demoTenant.id,
      },
    });
  }

  // Attach any orphan companies owned by demo admin to the demo tenant
  await prisma.company.updateMany({
    where: { ownerId: admin.id, tenantId: null },
    data: { tenantId: demoTenant.id },
  });

  console.log('Seeded demo tenant:', demoTenant.slug);
  console.log('Seeded login user:', admin.email);
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
