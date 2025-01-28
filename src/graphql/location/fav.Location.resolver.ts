import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { FavoriteLocationsService } from '../../modules/locations/fav.locations.service';
import {
  FavoriteLocationType,
  AddFavoriteLocationInput,
  UpdateFavoriteLocationInput,
} from '../types';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/GqlAuthGuard';
import { GraphQLContext } from '../auth/GraphQLContext';

@Resolver(() => FavoriteLocationType)
export class FavoriteLocationsResolver {
  constructor(
    private readonly favoriteLocationsService: FavoriteLocationsService,
  ) {}

  @Query(() => [FavoriteLocationType], {
    description: 'Get favorite locations by user ID',
  })
  @UseGuards(GqlAuthGuard)
  async getFavoriteLocations(@Args('userId') userId: string) {
    return this.favoriteLocationsService.getFavoritesByUser(Number(userId));
  }

  @Mutation(() => FavoriteLocationType, {
    description: 'Add a favorite location',
  })
  @UseGuards(GqlAuthGuard)
  async addFavoriteLocation(
    @Args('input') input: AddFavoriteLocationInput,
    @Context() context: GraphQLContext,
  ) {
    const userId = context.req.user!.id;
    return this.favoriteLocationsService.createFavorite({
      ...input,
      userId: Number(userId),
    });
  }

  @Mutation(() => FavoriteLocationType, {
    description: 'Update a favorite location',
  })
  @UseGuards(GqlAuthGuard)
  async updateFavoriteLocation(
    @Args('input') input: UpdateFavoriteLocationInput,
    @Context() context: GraphQLContext,
  ) {
    const userId = context.req.user!.id;
    return this.favoriteLocationsService.updateFavorite(
      Number(input.id),
      Number(userId),
      { city: input.city },
    );
  }
  @Mutation(() => Boolean, {
    description: 'Delete a favorite location',
  })
  @UseGuards(GqlAuthGuard)
  async deleteFavoriteLocation(
    @Args('id') id: string,
    @Context() context: GraphQLContext,
  ): Promise<boolean> {
    const userId = context.req.user!.id;
    await this.favoriteLocationsService.deleteFavorite(
      Number(id),
      Number(userId),
    );
    return true;
  }
}
