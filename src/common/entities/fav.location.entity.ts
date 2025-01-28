import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
@Unique(['city', 'user'])
export class FavoriteLocation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  city: string;

  @ManyToOne(() => User, (user) => user.locations)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
