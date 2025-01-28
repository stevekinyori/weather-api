import { ForecastResponse } from 'src/common/interfaces/forecast-response.interface';
/* eslint-disable @typescript-eslint/unbound-method */
import { BadRequestException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { ForecastController } from './forecast.controller';
import { WeatherService } from './weather.service';

describe('ForecastController', () => {
  let forecastController: ForecastController;
  let weatherService: jest.Mocked<WeatherService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForecastController],
      providers: [
        {
          provide: WeatherService,
          useValue: {
            getForecastByCity: jest.fn(),
          },
        },
      ],
    }).compile();

    forecastController = module.get<ForecastController>(ForecastController);
    weatherService = module.get<WeatherService>(
      WeatherService,
    ) as jest.Mocked<WeatherService>;
  });

  it('should be defined', () => {
    expect(forecastController).toBeDefined();
    expect(weatherService).toBeDefined();
  });

  describe('getWeatherForecast', () => {
    it('should throw BadRequestException if no city is provided', async () => {
      await expect(forecastController.getWeatherForecast('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return weather forecast data for a valid city', async () => {
      const mockForecastData: ForecastResponse = {
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
              sea_level: 1015,
              grnd_level: 1010,
              humidity: 78,
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

      weatherService.getForecastByCity.mockResolvedValue(mockForecastData);

      const result = await forecastController.getWeatherForecast('Nairobi');

      expect(weatherService.getForecastByCity).toHaveBeenCalledWith('Nairobi');
      expect(result).toEqual({
        message: 'Weather forecast data for Nairobi',
        forecast: mockForecastData,
      });
    });
  });
});
