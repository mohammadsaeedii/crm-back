import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { findMockUser } from '../users/mock-users';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: number, ownerId: number) {
    return this.prisma.company.findMany({
      where: { tenantId, ownerId },
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

  async findOne(tenantId: number, ownerId: number, id: number) {
    const company = await this.prisma.company.findFirst({
      where: { id, tenantId, ownerId },
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
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  create(tenantId: number, ownerId: number, dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        name: dto.name.trim(),
        ownerId,
        tenantId,
      },
      include: { members: true },
    });
  }

  async addMember(
    tenantId: number,
    ownerId: number,
    companyId: number,
    mockUserId: string,
  ) {
    await this.ensureOwned(tenantId, ownerId, companyId);

    const mock = findMockUser(mockUserId);
    if (!mock) {
      throw new BadRequestException('Invalid mock user');
    }

    const existing = await this.prisma.companyMember.findUnique({
      where: {
        companyId_mockUserId: { companyId, mockUserId },
      },
    });

    if (existing) {
      throw new ConflictException('User already in this company');
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

  async removeMember(
    tenantId: number,
    ownerId: number,
    companyId: number,
    memberId: number,
  ) {
    await this.ensureOwned(tenantId, ownerId, companyId);

    const member = await this.prisma.companyMember.findFirst({
      where: { id: memberId, companyId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.prisma.companyMember.delete({ where: { id: memberId } });
    return { deleted: true };
  }

  async remove(tenantId: number, ownerId: number, id: number) {
    await this.ensureOwned(tenantId, ownerId, id);
    await this.prisma.company.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureOwned(
    tenantId: number,
    ownerId: number,
    companyId: number,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.tenantId !== tenantId || company.ownerId !== ownerId) {
      throw new ForbiddenException('Not your company');
    }

    return company;
  }
}
