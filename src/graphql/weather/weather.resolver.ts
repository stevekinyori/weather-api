import { Resolver, Query, Args } from '@nestjs/graphql';
import { WeatherService } from '../../modules/weather/weather.service';
import { ForecastType, WeatherType } from '../types';

@Resolver('Weather')
export class WeatherResolver {
  constructor(private readonly weatherService: WeatherService) {}

  @Query(() => WeatherType)
  async getWeather(@Args('city') city: string) {
    return this.weatherService.getWeatherByCity(city);
  }

  @Query(() => ForecastType)
  async getForecast(@Args('city') city: string) {
    return this.weatherService.getForecastByCity(city);
  }
}
