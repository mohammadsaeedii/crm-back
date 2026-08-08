import { IsNotEmpty, IsString } from 'class-validator';

export class AddCompanyMemberDto {
  @IsString()
  @IsNotEmpty()
  mockUserId!: string;
}
