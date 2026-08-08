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
import { CurrentUserId } from '../common/decorators/current-user.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  list(@CurrentUserId() userId: number) {
    return this.companiesService.list(userId);
  }

  @Post()
  create(@CurrentUserId() userId: number, @Body() dto: CreateCompanyDto) {
    return this.companiesService.create(userId, dto);
  }

  @Get(':id')
  findOne(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.companiesService.findOne(userId, id);
  }

  @Delete(':id')
  remove(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.companiesService.remove(userId, id);
  }

  @Post(':id/members')
  addMember(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddCompanyMemberDto,
  ) {
    return this.companiesService.addMember(userId, id, dto.mockUserId);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @CurrentUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ) {
    return this.companiesService.removeMember(userId, id, memberId);
  }
}
