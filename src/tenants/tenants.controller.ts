import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { TenantsService } from './tenants.service';

class ProvisionTenantDto {
  @IsString()
  externalCustomerId!: string;

  @IsString()
  @MinLength(1)
  slug!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

@Controller('internal/tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  provision(
    @Headers('x-provisioning-secret') secret: string | undefined,
    @Body() dto: ProvisionTenantDto,
  ) {
    const expected = this.config.get<string>('PROVISIONING_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Invalid provisioning secret');
    }

    return this.tenantsService.provision(dto);
  }
}
