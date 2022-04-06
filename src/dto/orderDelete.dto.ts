import { IsNotEmpty } from 'class-validator';

export class OrderDeleteDTO {
  @IsNotEmpty()
  orderIdentificator: string;

  userId: number;
}
