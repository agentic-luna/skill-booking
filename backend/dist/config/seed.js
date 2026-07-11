"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperadmin = seedSuperadmin;
const prisma_1 = require("./prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const di_container_1 = require("../api/di-container");
async function seedSuperadmin() {
    const adminEmail = 'admin@luna.com';
    try {
        const existingAdmin = await prisma_1.prisma.user.findUnique({
            where: { email: adminEmail },
        });
        const passwordHash = await bcryptjs_1.default.hash('Admin@123', 10);
        if (!existingAdmin) {
            const user = await prisma_1.prisma.user.create({
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
            await prisma_1.prisma.adminProfile.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    userId: user.id,
                    department: 'Platform Management',
                    adminLevel: 1,
                },
            });
            di_container_1.logger.info(`[Seeder] Superadmin user created successfully: ${adminEmail} / password: Admin@123`);
        }
        else {
            // Ensure the password hash is updated to 'Admin@123' and role is SUPERADMIN
            await prisma_1.prisma.user.update({
                where: { email: adminEmail },
                data: {
                    passwordHash,
                    role: 'SUPERADMIN',
                    status: 'ACTIVE',
                },
            });
            di_container_1.logger.info(`[Seeder] Superadmin user verified and password ensured to Admin@123 dynamically on startup.`);
        }
    }
    catch (error) {
        di_container_1.logger.error('[Seeder] Error during superadmin seeding:', error);
    }
}
