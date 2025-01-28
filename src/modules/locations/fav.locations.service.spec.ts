import { CreateLocationDto } from 'src/common/dto/create-location.dto';
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteLocationsService } from './fav.locations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteLocation } from '../../common/entities/fav.location.entity';
import { User } from '../../common/entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('FavoriteLocationsService', () => {
  let service: FavoriteLocationsService;
  let favoriteLocationRepository: jest.Mocked<Repository<FavoriteLocation>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    locations: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLocation: FavoriteLocation = {
    id: 1,
    city: 'Nairobi',
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteLocationsService,
        {
          provide: getRepositoryToken(FavoriteLocation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FavoriteLocationsService>(FavoriteLocationsService);
    favoriteLocationRepository = module.get<Repository<FavoriteLocation>>(
      getRepositoryToken(FavoriteLocation),
    ) as jest.Mocked<Repository<FavoriteLocation>>;
    userRepository = module.get<Repository<User>>(
      getRepositoryToken(User),
    ) as jest.Mocked<Repository<User>>;
  });

  describe('createFavorite', () => {
    it('should create a new favorite location if no duplicate exists', async () => {
      const createLocationDto: CreateLocationDto = {
        city: 'Nairobi',
        userId: 1,
      };

      userRepository.findOne.mockResolvedValue(mockUser);
      favoriteLocationRepository.findOne.mockResolvedValue(null); // No existing location
      favoriteLocationRepository.create.mockReturnValue(mockLocation);
      favoriteLocationRepository.save.mockResolvedValue(mockLocation);
      const result = await service.createFavorite(createLocationDto);
      expect(favoriteLocationRepository.save).toHaveBeenCalledWith(
        mockLocation,
      );
      expect(result).toEqual(mockLocation);
    });

    it('should throw a ConflictException if a duplicate favorite location exists', async () => {
      const createLocationDto: CreateLocationDto = {
        city: 'Nairobi',
        userId: 1,
      };
      userRepository.findOne.mockResolvedValue(mockUser);
      favoriteLocationRepository.findOne.mockResolvedValue(mockLocation);
      await expect(service.createFavorite(createLocationDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw a NotFoundException if user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createFavorite({ city: 'Nairobi', userId: 999 }),
      ).rejects.toThrow(new NotFoundException(`User with ID 999 not found`));
    });
  });

  describe('getFavoritesByUser', () => {
    it('should return all favorite locations for a user', async () => {
      favoriteLocationRepository.find.mockResolvedValue([mockLocation]);

      const result = await service.getFavoritesByUser(mockUser.id);

      expect(favoriteLocationRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUser.id } },
      });
      expect(result).toEqual([mockLocation]);
    });
  });

  describe('updateFavorite', () => {
    it('should update and return the favorite location', async () => {
      const updateLocationDto = { city: 'Updated City' };
      const updatedLocation = { ...mockLocation, city: 'Updated City' };

      favoriteLocationRepository.findOne.mockResolvedValue(mockLocation);
      favoriteLocationRepository.save.mockResolvedValue(updatedLocation);

      const result = await service.updateFavorite(
        mockLocation.id,
        mockUser.id,
        updateLocationDto,
      );

      expect(favoriteLocationRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockLocation.id, user: { id: mockUser.id } },
      });
      expect(favoriteLocationRepository.save).toHaveBeenCalledWith({
        ...mockLocation,
        ...updateLocationDto,
      });
      expect(result).toEqual(updatedLocation);
    });

    it('should throw a NotFoundException if favorite location is not found', async () => {
      favoriteLocationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateFavorite(999, mockUser.id, { city: 'Updated City' }),
      ).rejects.toThrow(
        new NotFoundException(`Favorite location with id 999 not found`),
      );
    });
  });

  describe('deleteFavorite', () => {
    it('should delete a favorite location', async () => {
      favoriteLocationRepository.findOne.mockResolvedValue(mockLocation);
      favoriteLocationRepository.remove.mockResolvedValue(undefined as never);

      await service.deleteFavorite(mockLocation.id, mockUser.id);

      expect(favoriteLocationRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockLocation.id, user: { id: mockUser.id } },
      });
      expect(favoriteLocationRepository.remove).toHaveBeenCalledWith(
        mockLocation,
      );
    });

    it('should throw a NotFoundException if favorite location is not found', async () => {
      favoriteLocationRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteFavorite(999, mockUser.id)).rejects.toThrow(
        new NotFoundException(`Favorite location with id 999 not found`),
      );
    });
  });
});
