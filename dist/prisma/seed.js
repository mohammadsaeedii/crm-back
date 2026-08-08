"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
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
//# sourceMappingURL=seed.js.map