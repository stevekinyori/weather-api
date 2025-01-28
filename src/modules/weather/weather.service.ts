import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ForecastResponse } from '../../common/interfaces/forecast-response.interface';
import { WeatherResponse } from '../../common/interfaces/weather-response.interface';
import { handleApiError } from '../../common/utils/helpers';

@Injectable()
export class WeatherService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly cache = new Map<
    string,
    { data: unknown; timestamp: number }
  >();

  private readonly cacheTTL = 600000;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENWEATHER_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('OPENWEATHER_API_URL') || '';
  }
  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T;
    }
    return null;
  }
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  /**
   * Fetch current weather data for a city
   * @param city The name of the city
   */
  async getWeatherByCity(city: string): Promise<WeatherResponse> {
    const cacheKey = `weather-${city.toLowerCase()}`;
    const cachedWeather = this.getCache<WeatherResponse>(cacheKey);

    if (cachedWeather) {
      return cachedWeather;
    }
    try {
      const url = `${this.apiUrl}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
      const response = await this.httpService
        .get<WeatherResponse>(url)
        .toPromise();

      if (!response || !response.data) {
        throw new InternalServerErrorException('No weather data found');
      }

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, city);
    }
  }

  /**
   * Fetch 5-day weather forecast for a city
   * @param city The name of the city
   */
  async getForecastByCity(city: string): Promise<ForecastResponse> {
    const cacheKey = `forecast-${city.toLowerCase()}`;
    const cachedForecast = this.getCache<ForecastResponse>(cacheKey);

    if (cachedForecast) {
      return cachedForecast;
    }

    try {
      const url = `${this.apiUrl}/forecast?q=${city}&appid=${this.apiKey}&units=metric`;
      const response = await this.httpService
        .get<ForecastResponse>(url)
        .toPromise();

      if (!response || !response.data) {
        throw new InternalServerErrorException('No forecast data found');
      }

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      return handleApiError(error, city);
    }
  }
}
