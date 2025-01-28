import { Controller, Get, BadRequestException, Param } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  /**
   * Get current weather data for a city
   * @param city The name of the city (provided as a Param parameter)
   */
  @Get(':city')
  async getWeather(@Param('city') city: string) {
    if (!city) {
      throw new BadRequestException('City param parameter is required');
    }

    const weatherData = await this.weatherService.getWeatherByCity(city);
    return {
      message: `Weather data for ${city}`,
      weather: weatherData,
    };
  }
}
