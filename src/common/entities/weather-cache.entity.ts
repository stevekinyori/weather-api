import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class WeatherCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  city: string;

  @Column('jsonb')
  weatherData: any;

  @Column()
  cacheKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
