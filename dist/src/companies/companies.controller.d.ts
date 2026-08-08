import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AddCompanyMemberDto } from './dto/add-member.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    list(tenantId: number, userId: number): import("@prisma/client").Prisma.PrismaPromise<({
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
    create(tenantId: number, userId: number, dto: CreateCompanyDto): import("@prisma/client").Prisma.Prisma__CompanyClient<{
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
    findOne(tenantId: number, userId: number, id: number): Promise<{
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
    remove(tenantId: number, userId: number, id: number): Promise<{
        deleted: boolean;
    }>;
    addMember(tenantId: number, userId: number, id: number, dto: AddCompanyMemberDto): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        email: string;
        companyId: number;
        mockUserId: string;
    }>;
    removeMember(tenantId: number, userId: number, id: number, memberId: number): Promise<{
        deleted: boolean;
    }>;
}
