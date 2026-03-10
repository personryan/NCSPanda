import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['received', 'preparing', 'ready'])
  status!: 'received' | 'preparing' | 'ready';
}
