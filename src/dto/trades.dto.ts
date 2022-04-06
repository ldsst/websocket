import { IsNotEmpty } from 'class-validator';

export class TradesDTO {
  @IsNotEmpty()
  pair: string;
}
