import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Request } from 'express';
import type { JwtPayload } from './jwt-payload';
type AuthRequest = Request & {
    user: JwtPayload;
};
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            name: string | null;
        };
    }>;
    me(req: AuthRequest): Promise<{
        id: number;
        email: string;
        name: string | null;
    }>;
}
export {};
