import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('executed_orders')
export class ExecutedOrders extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { nullable: false })
  identificator: string;

  @Column({ type: 'int', nullable: false })
  int_done: number;

  @Column({ type: 'int', nullable: false })
  order_id: number;

  @Column({ type: 'int', nullable: false })
  done_with: number;

  @Column({ type: 'varchar', nullable: false })
  side: string;

  @Column('varchar', { nullable: true })
  pair: string;

  @ManyToOne(type => User, user => user.executed_orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('decimal', { nullable: false })
  price_unity: number;

  @Column('decimal', { nullable: false })
  order_amount: number;

  @Column('decimal', { nullable: false })
  amount_executed: number;

  @Column('decimal', { nullable: false })
  amount_left: number;

  @Column('decimal', { nullable: false })
  fee: number;

  @Column('decimal', { nullable: false })
  total: number;

  @Column('varchar', { nullable: true })
  time_executed: number;

  @Column('varchar', { nullable: true })
  currency_from: number;
}
