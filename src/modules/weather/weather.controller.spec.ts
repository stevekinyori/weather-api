import { BadRequestException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { WeatherResponse } from '../../common/interfaces/weather-response.interface';

describe('WeatherController', () => {
  let weatherController: WeatherController;
  let weatherService: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: {
            getWeatherByCity: jest.fn(),
          },
        },
      ],
    }).compile();

    weatherController = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  describe('getWeather', () => {
    it('should throw BadRequestException if no city is provided', async () => {
      await expect(weatherController.getWeather('')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return weather data for a valid city', async () => {
      const mockWeatherData: WeatherResponse = {
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
      jest
        .spyOn(weatherService, 'getWeatherByCity')
        .mockResolvedValue(mockWeatherData);

      const result = await weatherController.getWeather('Nairobi');

      expect(result).toEqual({
        message: 'Weather data for Nairobi',
        weather: mockWeatherData,
      });
    });
  });
});
