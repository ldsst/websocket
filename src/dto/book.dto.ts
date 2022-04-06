import { IsNotEmpty } from 'class-validator';

export class BookDTO {
  @IsNotEmpty()
  pair: string;
}
