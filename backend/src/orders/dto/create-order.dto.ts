import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  itemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  outletId!: string;

  @IsDateString()
  slotDate!: string;

  @IsString()
  @IsNotEmpty()
  slotId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  customerId?: string;
}

export { CreateOrderItemDto };
