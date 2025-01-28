import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { of } from 'rxjs';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { WeatherResponse } from '../../common/interfaces/weather-response.interface';
import { ForecastResponse } from '../../common/interfaces/forecast-response.interface';

describe('WeatherService', () => {
  let weatherService: WeatherService;
  let httpService: HttpService;

  const mockWeatherResponse: WeatherResponse = {
    coord: { lon: 36.8167, lat: -1.2833 },
    weather: [
      { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
    ],
    base: 'stations',
    main: {
      temp: 25.0,
      feels_like: 24.0,
      temp_min: 23.0,
      temp_max: 27.0,
      pressure: 1015,
      humidity: 78,
    },
    visibility: 10000,
    wind: { speed: 3.6, deg: 90 },
    clouds: { all: 0 },
    dt: 1633017600,
    sys: {
      type: 1,
      id: 2544,
      country: 'KE',
      sunrise: 1632988900,
      sunset: 1633032500,
    },
    timezone: 10800,
    id: 184745,
    name: 'Nairobi',
    cod: 200,
  };

  const mockForecastResponse: ForecastResponse = {
    cod: '200',
    message: 0,
    cnt: 1,
    list: [
      {
        dt: 1633017600,
        main: {
          temp: 25.0,
          feels_like: 24.0,
          temp_min: 23.0,
          temp_max: 27.0,
          pressure: 1015,
          humidity: 78,
          sea_level: 1015,
          grnd_level: 1015,
          temp_kf: 0,
        },
        weather: [
          { id: 800, main: 'Clear', description: 'clear sky', icon: '01d' },
        ],
        clouds: { all: 0 },
        wind: { speed: 3.6, deg: 90, gust: 4.5 },
        visibility: 10000,
        pop: 0,
        sys: { pod: 'd' },
        dt_txt: '2025-01-01 12:00:00',
      },
    ],
    city: {
      id: 184745,
      name: 'Nairobi',
      coord: { lat: -1.2833, lon: 36.8167 },
      country: 'KE',
      population: 2750547,
      timezone: 10800,
      sunrise: 1632988900,
      sunset: 1633032500,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-api-key'),
          },
        },
      ],
    }).compile();

    weatherService = module.get<WeatherService>(WeatherService);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('getWeatherByCity', () => {
    it('should return cached data if available and valid', async () => {
      weatherService['cache'].set('weather-nairobi', {
        data: mockWeatherResponse,
        timestamp: Date.now(),
      });

      const result = await weatherService.getWeatherByCity('Nairobi');

      expect(result).toEqual(mockWeatherResponse);
    });

    it('should fetch weather data from API if not cached', async () => {
      const axiosResponse: AxiosResponse<WeatherResponse> = {
        data: mockWeatherResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await weatherService.getWeatherByCity('Nairobi');

      expect(result).toEqual(mockWeatherResponse);
      expect(weatherService['cache'].has('weather-nairobi')).toBe(true);
    });

    it('should throw InternalServerErrorException if API response is invalid', async () => {
      const axiosResponse: AxiosResponse<WeatherResponse> = {
        data: undefined as unknown as WeatherResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      await expect(weatherService.getWeatherByCity('Nairobi')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException on API errors', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw new Error('API Error');
      });

      await expect(weatherService.getWeatherByCity('Nairobi')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getForecastByCity', () => {
    it('should return cached forecast data if available and valid', async () => {
      weatherService['cache'].set('forecast-nairobi', {
        data: mockForecastResponse,
        timestamp: Date.now(),
      });

      const result = await weatherService.getForecastByCity('Nairobi');

      expect(result).toEqual(mockForecastResponse);
    });

    it('should fetch forecast data from API if not cached', async () => {
      const axiosResponse: AxiosResponse<ForecastResponse> = {
        data: mockForecastResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      const result = await weatherService.getForecastByCity('Nairobi');

      expect(result).toEqual(mockForecastResponse);
      expect(weatherService['cache'].has('forecast-nairobi')).toBe(true);
    });

    it('should throw InternalServerErrorException if API response is invalid', async () => {
      const axiosResponse: AxiosResponse<ForecastResponse> = {
        data: undefined as unknown as ForecastResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      jest.spyOn(httpService, 'get').mockReturnValue(of(axiosResponse));

      await expect(weatherService.getForecastByCity('Nairobi')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException on API errors', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() => {
        throw new Error('API Error');
      });

      await expect(weatherService.getForecastByCity('Nairobi')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
