import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class PickupSlotsQueryDto {
  @IsString()
  @IsNotEmpty()
  outletId!: string;

  @IsDateString()
  date!: string;
}
