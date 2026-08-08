"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mock_users_1 = require("../users/mock-users");
let CompaniesService = class CompaniesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    list(ownerId) {
        return this.prisma.company.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' },
            include: {
                members: {
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true,
                        mockUserId: true,
                        name: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
        });
    }
    async findOne(ownerId, id) {
        const company = await this.prisma.company.findFirst({
            where: { id, ownerId },
            include: {
                members: {
                    orderBy: { createdAt: 'asc' },
                    select: {
                        id: true,
                        mockUserId: true,
                        name: true,
                        email: true,
                        createdAt: true,
                    },
                },
            },
        });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        return company;
    }
    create(ownerId, dto) {
        return this.prisma.company.create({
            data: {
                name: dto.name.trim(),
                ownerId,
            },
            include: { members: true },
        });
    }
    async addMember(ownerId, companyId, mockUserId) {
        await this.ensureOwned(ownerId, companyId);
        const mock = (0, mock_users_1.findMockUser)(mockUserId);
        if (!mock) {
            throw new common_1.BadRequestException('Invalid mock user');
        }
        const existing = await this.prisma.companyMember.findUnique({
            where: {
                companyId_mockUserId: { companyId, mockUserId },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('User already in this company');
        }
        return this.prisma.companyMember.create({
            data: {
                companyId,
                mockUserId: mock.id,
                name: mock.name,
                email: mock.email,
            },
        });
    }
    async removeMember(ownerId, companyId, memberId) {
        await this.ensureOwned(ownerId, companyId);
        const member = await this.prisma.companyMember.findFirst({
            where: { id: memberId, companyId },
        });
        if (!member) {
            throw new common_1.NotFoundException('Member not found');
        }
        await this.prisma.companyMember.delete({ where: { id: memberId } });
        return { deleted: true };
    }
    async remove(ownerId, id) {
        await this.ensureOwned(ownerId, id);
        await this.prisma.company.delete({ where: { id } });
        return { deleted: true };
    }
    async ensureOwned(ownerId, companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
        });
        if (!company) {
            throw new common_1.NotFoundException('Company not found');
        }
        if (company.ownerId !== ownerId) {
            throw new common_1.ForbiddenException('Not your company');
        }
        return company;
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map