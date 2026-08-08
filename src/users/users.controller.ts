import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MOCK_USERS } from './mock-users';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get('mock')
  listMock() {
    return MOCK_USERS;
  }
}
