import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { logger } from '../api/di-container';

export async function seedSuperadmin() {
  const adminEmail = 'admin@luna.com';
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    const passwordHash = await bcrypt.hash('Admin@123', 10);

    if (!existingAdmin) {
      const user = await prisma.user.create({
        data: {
          firstName: 'Luna',
          lastName: 'Admin',
          email: adminEmail,
          phone: '+15550100',
          passwordHash,
          role: 'SUPERADMIN',
          status: 'ACTIVE',
        },
      });

      // Upsert default AdminProfile
      await prisma.adminProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          department: 'Platform Management',
          adminLevel: 1,
        },
      });

      logger.info(`[Seeder] Superadmin user created successfully: ${adminEmail} / password: Admin@123`);
    } else {
      // Ensure the password hash is updated to 'Admin@123' and role is SUPERADMIN
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          passwordHash,
          role: 'SUPERADMIN',
          status: 'ACTIVE',
        },
      });
      logger.info(`[Seeder] Superadmin user verified and password ensured to Admin@123 dynamically on startup.`);
    }
  } catch (error) {
    logger.error('[Seeder] Error during superadmin seeding:', error);
  }
}
