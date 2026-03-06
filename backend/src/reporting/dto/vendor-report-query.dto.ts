import { IsDateString, IsOptional, IsString } from 'class-validator';

export class VendorReportQueryDto {
  @IsString()
  outletId!: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
