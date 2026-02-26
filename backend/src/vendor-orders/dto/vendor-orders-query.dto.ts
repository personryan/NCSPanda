import { IsIn, IsOptional, IsString } from 'class-validator';

export class VendorOrdersQueryDto {
  @IsString()
  vendorOutletId!: string;

  @IsOptional()
  @IsString()
  slotDate?: string;

  @IsOptional()
  @IsIn(['received', 'preparing', 'ready'])
  status?: 'received' | 'preparing' | 'ready';
}
