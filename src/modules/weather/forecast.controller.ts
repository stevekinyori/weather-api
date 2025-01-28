import { Controller, Get, BadRequestException, Param } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('forecast')
export class ForecastController {
  constructor(private readonly weatherService: WeatherService) {}
  /**
   * Get current weather forecast data for a city
   * @param city The name of the city (provided as a query parameter)
   */
  @Get(':city')
  async getWeatherForecast(@Param('city') city: string) {
    if (!city) {
      throw new BadRequestException('City param parameter is required');
    }

    const weatherData = await this.weatherService.getForecastByCity(city);
    return {
      message: `Weather forecast data for ${city}`,
      forecast: weatherData,
    };
  }
}
