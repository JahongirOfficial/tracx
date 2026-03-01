require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  const username = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@2024!';

  const existing = await prisma.superAdmin.findUnique({ where: { username } });
  if (existing) {
    console.log(`SuperAdmin "${username}" already exists`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const admin = await prisma.superAdmin.create({
    data: { username, password: hashed },
  });

  console.log(`SuperAdmin created: ${admin.username} (ID: ${admin.id})`);
}

seedSuperAdmin()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
