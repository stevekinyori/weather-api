import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLocationDto } from '../../common/dto/create-location.dto';
import { UpdateLocationDto } from '../../common/dto/update-location.dto';
import { FavoriteLocation } from '../../common/entities/fav.location.entity';
import { User } from '../../common/entities/user.entity';

@Injectable()
export class FavoriteLocationsService {
  constructor(
    @InjectRepository(FavoriteLocation)
    private readonly favoriteLocationRepository: Repository<FavoriteLocation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createFavorite(
    createLocationDto: CreateLocationDto,
  ): Promise<FavoriteLocation> {
    const { userId, city } = createLocationDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    const existingLocation = await this.favoriteLocationRepository.findOne({
      where: { city, user: { id: userId } },
    });

    if (existingLocation) {
      throw new ConflictException(
        `Favorite location for city '${city}' already exists for user ${userId}`,
      );
    }

    const favoriteLocation = this.favoriteLocationRepository.create({
      city,
      user,
    });

    return this.favoriteLocationRepository.save(favoriteLocation);
  }

  async getFavoritesByUser(userId: number): Promise<FavoriteLocation[]> {
    return this.favoriteLocationRepository.find({
      where: { user: { id: userId } },
    });
  }

  async updateFavorite(
    id: number,
    userId: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<FavoriteLocation> {
    const location = await this.favoriteLocationRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!location) {
      throw new NotFoundException(`Favorite location with id ${id} not found`);
    }

    Object.assign(location, updateLocationDto);
    return this.favoriteLocationRepository.save(location);
  }

  async deleteFavorite(id: number, userId: number): Promise<void> {
    const location = await this.favoriteLocationRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!location) {
      throw new NotFoundException(`Favorite location with id ${id} not found`);
    }

    await this.favoriteLocationRepository.remove(location);
  }
}
