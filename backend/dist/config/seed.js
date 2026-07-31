"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperadmin = seedSuperadmin;
exports.seedBoostPricing = seedBoostPricing;
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
async function seedBoostPricing() {
    try {
        const boostPricingKey = 'BOOST_PRICING';
        const existing = await prisma_1.prisma.platformSetting.findUnique({
            where: { key: boostPricingKey }
        });
        if (!existing) {
            const defaultPricing = [
                { id: "basic-3", tier: "BASIC", days: 3, price: 299 },
                { id: "basic-7", tier: "BASIC", days: 7, price: 599 },
                { id: "basic-15", tier: "BASIC", days: 15, price: 999 },
                { id: "basic-30", tier: "BASIC", days: 30, price: 1699 },
                { id: "standard-3", tier: "STANDARD", days: 3, price: 699 },
                { id: "standard-7", tier: "STANDARD", days: 7, price: 1299 },
                { id: "standard-15", tier: "STANDARD", days: 2199 },
                { id: "standard-30", tier: "STANDARD", days: 30, price: 3799 },
                { id: "pro-3", tier: "PRO", days: 3, price: 1999 },
                { id: "pro-7", tier: "PRO", days: 7, price: 3999 },
                { id: "pro-15", tier: "PRO", days: 15, price: 6999 },
                { id: "pro-30", tier: "PRO", days: 30, price: 11999 }
            ];
            await prisma_1.prisma.platformSetting.create({
                data: {
                    key: boostPricingKey,
                    value: defaultPricing
                }
            });
            di_container_1.logger.info('[Seeder] Default boost pricing settings seeded successfully on startup.');
        }
    }
    catch (error) {
        di_container_1.logger.error('[Seeder] Error during boost pricing seeding:', error);
    }
}
