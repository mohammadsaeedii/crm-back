import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
export declare class CompaniesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(ownerId: number): import("@prisma/client").Prisma.PrismaPromise<({
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
    findOne(ownerId: number, id: number): Promise<{
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
    create(ownerId: number, dto: CreateCompanyDto): import("@prisma/client").Prisma.Prisma__CompanyClient<{
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
    addMember(ownerId: number, companyId: number, mockUserId: string): Promise<{
        id: number;
        email: string;
        name: string;
        createdAt: Date;
        companyId: number;
        mockUserId: string;
    }>;
    removeMember(ownerId: number, companyId: number, memberId: number): Promise<{
        deleted: boolean;
    }>;
    remove(ownerId: number, id: number): Promise<{
        deleted: boolean;
    }>;
    private ensureOwned;
}
