import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ExchangeTicketDto } from './dto/exchange-ticket.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { JwtPayload } from './jwt-payload';
import { SsoService } from './sso.service';

type AuthRequest = Request & { user: JwtPayload };

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly ssoService: SsoService,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  logout() {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: AuthRequest) {
    return this.authService.getMe(req.user.userId);
  }

  @Get('sso/start')
  async ssoStart(
    @Query('returnTo') returnTo: string | undefined,
    @Res() res: Response,
  ) {
    const { authorizeUrl } = await this.ssoService.start(returnTo);
    return res.redirect(302, authorizeUrl);
  }

  @Post('sso/start')
  async ssoStartJson(@Body('returnTo') returnTo?: string) {
    return this.ssoService.start(returnTo);
  }

  @Get('sso/callback')
  async ssoCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ) {
    const { redirectTo } = await this.ssoService.handleCallback(code, state);
    return res.redirect(302, redirectTo);
  }

  @Post('sso/exchange')
  exchangeTicket(@Body() dto: ExchangeTicketDto) {
    return this.ssoService.exchangeTicket(dto.ticket);
  }
}
