import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { CreateLocationDto } from '../../common/dto/create-location.dto';
import { UpdateLocationDto } from '../../common/dto/update-location.dto';
import { FavoriteLocationsService } from './fav.locations.service';
import { User } from '../../common/entities/user.entity';
import { getErrorMessage } from 'src/common/utils/helpers';

@Controller('locations')
export class FavoriteLocationsController {
  constructor(
    private readonly favoriteLocationsService: FavoriteLocationsService,
  ) {}

  /**
   * Create a new favorite location (Requires Authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createFavorite(
    @Body() createLocationDto: CreateLocationDto,
    @Request() req: { user: User },
  ) {
    try {
      const userId: number = req.user.id;
      const location = await this.favoriteLocationsService.createFavorite({
        ...createLocationDto,
        userId,
      });
      return { message: 'Favorite location created successfully', location };
    } catch (error) {
      throw new HttpException(getErrorMessage(error), HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get all favorite locations for a user (Requires Authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getFavorites(@Request() req: { user: User }) {
    const userId = req.user.id;
    const locations =
      await this.favoriteLocationsService.getFavoritesByUser(userId);
    return { message: 'Favorite locations retrieved successfully', locations };
  }

  /**
   * Update a favorite location (Requires Authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateFavorite(
    @Param('id') id: number,
    @Body() updateLocationDto: UpdateLocationDto,
    @Request() req: { user: User },
  ) {
    const userId = req.user.id;
    const updatedLocation = await this.favoriteLocationsService.updateFavorite(
      id,
      userId,
      updateLocationDto,
    );
    return {
      message: 'Favorite location updated successfully',
      updatedLocation,
    };
  }

  /**
   * Delete a favorite location (Requires Authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteFavorite(
    @Param('id') id: number,
    @Request() req: { user: User },
  ) {
    const userId = req.user.id;
    await this.favoriteLocationsService.deleteFavorite(id, userId);
    return { message: `Favorite location with id ${id} deleted successfully` };
  }
}
