import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateAdminUserDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  role_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
