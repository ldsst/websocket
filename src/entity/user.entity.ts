import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { Order } from './order.entity';
import { ExecutedOrders } from './executed-orders.entity';

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  uid: string;

  @Column()
  brl: number;

  @Column()
  hold_brl: number;

  @Column()
  btc: number;

  @Column()
  hold_btc: number;

  @Column()
  eth: number;

  @Column()
  hold_eth: number;

  @Column()
  bch: number;

  @Column()
  hold_bch: number;

  @Column()
  ltc: number;

  @Column()
  hold_ltc: number;

  @Column()
  xrp: number;

  @Column()
  hold_xrp: number;

  @Column()
  dash: number;

  @Column()
  hold_dash: number;

  @Column()
  zec: number;

  @Column()
  hold_zec: number;

  @Column()
  xmr: number;

  @Column()
  hold_xmr: number;

  @OneToMany(type => Order, order => order.user)
  orders: Order[];

  @OneToMany(type => ExecutedOrders, executedOrders => executedOrders.user)
  executed_orders: ExecutedOrders[];
}
