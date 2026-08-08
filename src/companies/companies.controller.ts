import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { AddCompanyMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CurrentTenantId,
  CurrentUserId,
} from '../common/decorators/current-user.decorator';
import { TenantHostGuard } from '../tenants/tenant-host.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard, TenantHostGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  list(
    @CurrentTenantId() tenantId: number,
    @CurrentUserId() userId: number,
  ) {
    return this.companiesService.list(tenantId, userId);
  }

  @Post()
  create(
    @CurrentTenantId() tenantId: number,
    @CurrentUserId() userId: number,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.companiesService.create(tenantId, userId, dto);
  }

  @Get(':id')
  findOne(
    @CurrentTenantId() tenantId: number,
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.companiesService.findOne(tenantId, userId, id);
  }

  @Delete(':id')
  remove(
    @CurrentTenantId() tenantId: number,
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.companiesService.remove(tenantId, userId, id);
  }

  @Post(':id/members')
  addMember(
    @CurrentTenantId() tenantId: number,
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddCompanyMemberDto,
  ) {
    return this.companiesService.addMember(
      tenantId,
      userId,
      id,
      dto.mockUserId,
    );
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @CurrentTenantId() tenantId: number,
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.companiesService.removeMember(
      tenantId,
      userId,
      id,
      memberId,
    );
  }
}
