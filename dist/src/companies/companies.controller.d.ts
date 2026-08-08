import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AddCompanyMemberDto } from './dto/add-member.dto';
export declare class CompaniesController {
    private readonly companiesService;
    constructor(companiesService: CompaniesService);
    list(userId: number): import("@prisma/client").Prisma.PrismaPromise<({
        members: {
            id: number;
            email: string;
            name: string;
            createdAt: Date;
            mockUserId: string;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: number;
    })[]>;
    create(userId: number, dto: CreateCompanyDto): import("@prisma/client").Prisma.Prisma__CompanyClient<{
        members: {
            id: number;
            email: string;
            name: string;
            createdAt: Date;
            companyId: number;
            mockUserId: string;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    findOne(userId: number, id: number): Promise<{
        members: {
            id: number;
            email: string;
            name: string;
            createdAt: Date;
            mockUserId: string;
        }[];
    } & {
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        ownerId: number;
    }>;
    remove(userId: number, id: number): Promise<{
        deleted: boolean;
    }>;
    addMember(userId: number, id: number, dto: AddCompanyMemberDto): Promise<{
        id: number;
        email: string;
        name: string;
        createdAt: Date;
        companyId: number;
        mockUserId: string;
    }>;
    removeMember(userId: number, id: number, memberId: number): Promise<{
        deleted: boolean;
    }>;
}
