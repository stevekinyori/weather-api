/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteLocationsResolver } from './fav.Location.resolver';
import { FavoriteLocationsService } from '../../modules/locations/fav.locations.service';
import { User } from '../../common/entities/user.entity';
import { createRequest } from 'node-mocks-http';
import { GraphQLContext } from '../auth/GraphQLContext';

describe('FavoriteLocationResolver', () => {
  let resolver: FavoriteLocationsResolver;
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
      providers: [
        FavoriteLocationsResolver,
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
    }).compile();

    resolver = module.get<FavoriteLocationsResolver>(FavoriteLocationsResolver);
    service = module.get<FavoriteLocationsService>(
      FavoriteLocationsService,
    ) as jest.Mocked<FavoriteLocationsService>;
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('addFavoriteLocation', () => {
    it('should create a new favorite location', async () => {
      service.createFavorite.mockResolvedValue(mockLocation);
      const mockContext: GraphQLContext = {
        req: Object.assign(createRequest(), {
          user: mockUser,
        }),
      };
      const result = await resolver.addFavoriteLocation(
        { city: 'Nairobi' },
        mockContext,
      );

      expect(service.createFavorite).toHaveBeenCalledWith({
        city: 'Nairobi',
        userId: 1,
      });
      expect(result).toEqual(mockLocation);
    });
  });

  describe('getFavoriteLocations', () => {
    it('should return all favorite locations for a user', async () => {
      service.getFavoritesByUser.mockResolvedValue([mockLocation]);

      const result = await resolver.getFavoriteLocations('1');

      expect(service.getFavoritesByUser).toHaveBeenCalledWith(1);
      expect(result).toEqual([mockLocation]);
    });
  });

  describe('updateFavoriteLocation', () => {
    it('should update a favorite location', async () => {
      const updatedLocation = { ...mockLocation, city: 'New City' };
      service.updateFavorite.mockResolvedValue(updatedLocation);

      const mockContext: GraphQLContext = {
        req: Object.assign(createRequest(), {
          user: mockUser,
        }),
      };

      const result = await resolver.updateFavoriteLocation(
        {
          id: '1',
          city: 'New City',
        },
        mockContext,
      );

      expect(service.updateFavorite).toHaveBeenCalledWith(1, 1, {
        city: 'New City',
      });
      expect(result).toEqual(updatedLocation);
    });
  });

  describe('deleteFavoriteLocation', () => {
    it('should delete a favorite location', async () => {
      service.deleteFavorite.mockResolvedValue(undefined);

      const mockContext: GraphQLContext = {
        req: Object.assign(createRequest(), {
          user: mockUser,
        }),
      };

      const result = await resolver.deleteFavoriteLocation('1', mockContext);

      expect(service.deleteFavorite).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(true);
    });
  });
});
