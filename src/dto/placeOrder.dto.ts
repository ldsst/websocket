import { IsPositive, IsNotEmpty } from 'class-validator';

export class PlaceOrderDTO {
  // @IsNotEmpty()
  // token: string;

  @IsNotEmpty()
  pair: string;

  @IsNotEmpty()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsPositive()
  price: number;

  userId: number;

  userUid: string;

  bridge_price: number; // usado apenas pelo bot

  bridge_from: number; // usado apenas pelo bot

  bridge_orderid: string; // usado apenas pelo bot

  our_order: number; // usado apenas pelo bot

  @IsNotEmpty()
  order_type: string;
}
