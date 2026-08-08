import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
export declare class CompaniesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(tenantId: number, ownerId: number): import("@prisma/client").Prisma.PrismaPromise<({
        members: {
            id: number;
            name: string;
            createdAt: Date;
            email: string;
            mockUserId: string;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: number | null;
        ownerId: number;
    })[]>;
    findOne(tenantId: number, ownerId: number, id: number): Promise<{
        members: {
            id: number;
            name: string;
            createdAt: Date;
            email: string;
            mockUserId: string;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: number | null;
        ownerId: number;
    }>;
    create(tenantId: number, ownerId: number, dto: CreateCompanyDto): import("@prisma/client").Prisma.Prisma__CompanyClient<{
        members: {
            id: number;
            name: string;
            createdAt: Date;
            email: string;
            companyId: number;
            mockUserId: string;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: number | null;
        ownerId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    addMember(tenantId: number, ownerId: number, companyId: number, mockUserId: string): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        email: string;
        companyId: number;
        mockUserId: string;
    }>;
    removeMember(tenantId: number, ownerId: number, companyId: number, memberId: number): Promise<{
        deleted: boolean;
    }>;
    remove(tenantId: number, ownerId: number, id: number): Promise<{
        deleted: boolean;
    }>;
    private ensureOwned;
}
