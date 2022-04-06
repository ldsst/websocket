import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { User } from './user.entity';
import { generateHashId } from '../utils/hashId';

@Entity('orders')
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  done: number;

  @Column()
  user_id: number;

  @Column()
  del: number;

  @Column()
  side: string;

  @Column()
  pair: string;

  @Column()
  currency_from: string;

  @Column()
  price_unity: number;

  @Column()
  amount: number;

  @Column()
  amount_source: number;

  @Column()
  total: number;

  @Column()
  time: string;

  @Column()
  locked: number;

  @Column()
  identificator: string;

  @ManyToOne(type => User, user => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @BeforeInsert()
  addId() {
    this.identificator = generateHashId();
  }
}
