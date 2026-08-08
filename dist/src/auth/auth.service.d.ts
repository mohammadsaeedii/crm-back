import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            name: string | null;
            tenantId: number;
            slug: string;
            authProvider: string;
        };
    }>;
    getMe(userId: number): Promise<{
        id: number;
        email: string;
        name: string | null;
        tenantId: number | null;
        slug: string | null;
        tenantName: string | null;
        authProvider: string;
    }>;
    logout(): Promise<{
        loggedOut: boolean;
    }>;
}
