import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();

    // Local password login is only for demo/local users — never SSO-mapped accounts
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        authProvider: 'local',
        passwordHash: { not: null },
      },
      include: { tenant: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.tenantId || !user.tenant) {
      throw new UnauthorizedException('User is not assigned to a tenant');
    }

    const payload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      slug: user.tenant.slug,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenantId: user.tenantId,
        slug: user.tenant.slug,
        authProvider: user.authProvider,
      },
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        tenantId: true,
        authProvider: true,
        tenant: { select: { slug: true, name: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      tenantId: user.tenantId,
      slug: user.tenant?.slug ?? null,
      tenantName: user.tenant?.name ?? null,
      authProvider: user.authProvider,
    };
  }

  async logout() {
    return { loggedOut: true };
  }
}
