/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteLocationsController } from './fav.locations.controller';
import { FavoriteLocationsService } from './fav.locations.service';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { CreateLocationDto } from '../../common/dto/create-location.dto';
import { UpdateLocationDto } from '../../common/dto/update-location.dto';
import { User } from '../../common/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('FavoriteLocationsController', () => {
  let controller: FavoriteLocationsController;
  let service: jest.Mocked<FavoriteLocationsService>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    locations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLocation = {
    id: 1,
    city: 'Nairobi',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteLocationsController],
      providers: [
        {
          provide: FavoriteLocationsService,
          useValue: {
            createFavorite: jest.fn(),
            getFavoritesByUser: jest.fn(),
            updateFavorite: jest.fn(),
            deleteFavorite: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest.fn().mockReturnValue(true),
      })
      .compile();

    controller = module.get<FavoriteLocationsController>(
      FavoriteLocationsController,
    );
    service = module.get<FavoriteLocationsService>(
      FavoriteLocationsService,
    ) as jest.Mocked<FavoriteLocationsService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createFavorite', () => {
    it('should create a new favorite location', async () => {
      const createLocationDto: CreateLocationDto = {
        city: 'Nairobi',
        userId: 1,
      };
      service.createFavorite.mockResolvedValue(mockLocation);

      const result = await controller.createFavorite(createLocationDto, {
        user: mockUser,
      });

      expect(service.createFavorite).toHaveBeenCalledWith({
        ...createLocationDto,
        userId: mockUser.id,
      });
      expect(result).toEqual({
        message: 'Favorite location created successfully',
        location: mockLocation,
      });
    });
  });

  describe('getFavorites', () => {
    it('should return all favorite locations for the user', async () => {
      const locations = [mockLocation];
      service.getFavoritesByUser.mockResolvedValue(locations);

      const result = await controller.getFavorites({ user: mockUser });

      expect(service.getFavoritesByUser).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        message: 'Favorite locations retrieved successfully',
        locations,
      });
    });
  });

  describe('updateFavorite', () => {
    it('should update a favorite location', async () => {
      const updateLocationDto: UpdateLocationDto = { city: 'Updated City' };
      const updatedLocation = { ...mockLocation, city: 'Updated City' };
      service.updateFavorite.mockResolvedValue(updatedLocation);

      const result = await controller.updateFavorite(
        mockLocation.id,
        updateLocationDto,
        { user: mockUser },
      );

      expect(service.updateFavorite).toHaveBeenCalledWith(
        mockLocation.id,
        mockUser.id,
        updateLocationDto,
      );
      expect(result).toEqual({
        message: 'Favorite location updated successfully',
        updatedLocation,
      });
    });

    it('should throw an error if the user is unauthorized', async () => {
      service.updateFavorite.mockRejectedValue(
        new UnauthorizedException('Unauthorized'),
      );

      await expect(
        controller.updateFavorite(
          mockLocation.id,
          { city: 'New City' },
          {
            user: mockUser,
          },
        ),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('deleteFavorite', () => {
    it('should delete a favorite location', async () => {
      service.deleteFavorite.mockResolvedValue(undefined);

      const result = await controller.deleteFavorite(mockLocation.id, {
        user: mockUser,
      });

      expect(service.deleteFavorite).toHaveBeenCalledWith(
        mockLocation.id,
        mockUser.id,
      );
      expect(result).toEqual({
        message: `Favorite location with id ${mockLocation.id} deleted successfully`,
      });
    });

    it('should throw an error if the user is unauthorized', async () => {
      service.deleteFavorite.mockRejectedValue(
        new UnauthorizedException('Unauthorized'),
      );

      await expect(
        controller.deleteFavorite(mockLocation.id, { user: mockUser }),
      ).rejects.toThrow('Unauthorized');
    });
  });
});
