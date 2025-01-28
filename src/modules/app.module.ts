/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { User } from '../common/entities/user.entity';
import { WeatherCache } from '../common/entities/weather-cache.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FavoriteLocation } from '../common/entities/fav.location.entity';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AppResolver } from '../graphql/app.resolver';
import { WeatherResolver } from '../graphql/weather/weather.resolver';
import { FavoriteLocationsModule } from './locations/fav.locations.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WeatherModule } from './weather/weather.module';
import { UsersResolver } from '../graphql/users/users.resolver';
import { FavoriteLocationsResolver } from '../graphql/location/fav.Location.resolver';
import { AuthResolver } from '../graphql/auth/auth.resolver';
import { AppThrottlerGuard } from '../graphql/auth/GqlThrottlerGuard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '', 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'weather_api',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([FavoriteLocation, User, WeatherCache]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 600000,
        limit: 5,
      },
    ]),
    WeatherModule,
    FavoriteLocationsModule,
    UsersModule,
    AuthModule,
  ],
  providers: [
    AppResolver,
    WeatherResolver,
    UsersResolver,
    FavoriteLocationsResolver,
    AuthResolver,
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
})
export class AppModule {}
