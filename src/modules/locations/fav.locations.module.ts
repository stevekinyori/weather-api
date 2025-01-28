import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FavoriteLocationsService } from './fav.locations.service';
import { FavoriteLocationsController } from './fav.locations.controller';
import { FavoriteLocation } from '../../common/entities/fav.location.entity';
import { HttpModule } from '@nestjs/axios';
import { User } from '../../common/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteLocation, User]), HttpModule],
  controllers: [FavoriteLocationsController],
  providers: [FavoriteLocationsService],
  exports: [FavoriteLocationsService],
})
export class FavoriteLocationsModule {}
