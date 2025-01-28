import { Field, ObjectType, InputType, Int, ID } from '@nestjs/graphql';

@ObjectType('User')
export class UserType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  username: string;

  @Field(() => [FavoriteLocationType], { nullable: true })
  locations?: FavoriteLocationType[];

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}

@ObjectType('FavoriteLocation')
export class FavoriteLocationType {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  city: string;

  @Field(() => UserType)
  user: UserType;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}

@ObjectType('Weather')
export class WeatherType {
  @Field(() => String)
  temperature: string;

  @Field(() => String)
  description: string;

  @Field(() => Int)
  humidity: number;

  @Field(() => Int)
  windSpeed: number;
}

@ObjectType('Forecast')
export class ForecastType {
  @Field(() => String)
  date: string;

  @Field(() => String)
  temperature: string;

  @Field(() => String)
  description: string;
}

@ObjectType('AuthPayload')
export class AuthPayloadType {
  @Field(() => String)
  token: string;

  @Field(() => UserType)
  user: UserType;
}

@InputType('RegisterInput')
export class RegisterInput {
  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;
}

@InputType('LoginInput')
export class LoginInput {
  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;
}

@InputType('AddFavoriteLocationInput')
export class AddFavoriteLocationInput {
  @Field(() => String)
  city: string;
}

@InputType('UpdateFavoriteLocationInput')
export class UpdateFavoriteLocationInput {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  city: string;
}
