import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ExchangeTicketDto } from './dto/exchange-ticket.dto';
import type { JwtPayload } from './jwt-payload';
import { SsoService } from './sso.service';
type AuthRequest = Request & {
    user: JwtPayload;
};
export declare class AuthController {
    private readonly authService;
    private readonly ssoService;
    constructor(authService: AuthService, ssoService: SsoService);
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
    logout(): Promise<{
        loggedOut: boolean;
    }>;
    me(req: AuthRequest): Promise<{
        id: number;
        email: string;
        name: string | null;
        tenantId: number | null;
        slug: string | null;
        tenantName: string | null;
        authProvider: string;
    }>;
    ssoStart(returnTo: string | undefined, res: Response): Promise<void>;
    ssoStartJson(returnTo?: string): Promise<{
        authorizeUrl: string;
    }>;
    ssoCallback(code: string | undefined, state: string | undefined, res: Response): Promise<void>;
    exchangeTicket(dto: ExchangeTicketDto): Promise<{
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
}
export {};
