/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { WeatherResolver } from './weather.resolver';
import { WeatherService } from '../../modules/weather/weather.service';

describe('WeatherResolver', () => {
  let resolver: WeatherResolver;
  let weatherService: jest.Mocked<WeatherService>;

  const mockWeather = {
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

  const mockForecast = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherResolver,
        {
          provide: WeatherService,
          useValue: {
            getWeatherByCity: jest.fn(),
            getForecastByCity: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<WeatherResolver>(WeatherResolver);
    weatherService = module.get<WeatherService>(
      WeatherService,
    ) as jest.Mocked<WeatherService>;
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return weather data for a valid city', async () => {
      weatherService.getWeatherByCity.mockResolvedValue(mockWeather);

      const result = await resolver.getWeather('Nairobi');

      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith('Nairobi');
      expect(result).toEqual(mockWeather);
    });

    it('should throw an error if city is invalid', async () => {
      weatherService.getWeatherByCity.mockRejectedValue(
        new Error('City not found'),
      );

      await expect(resolver.getWeather('UnknownCity')).rejects.toThrow(
        'City not found',
      );

      expect(weatherService.getWeatherByCity).toHaveBeenCalledWith(
        'UnknownCity',
      );
    });
  });
  describe('getForecast', () => {
    it('should return forecast data for a valid city', async () => {
      weatherService.getForecastByCity.mockResolvedValue(mockForecast);

      const result = await resolver.getForecast('Nairobi');

      expect(weatherService.getForecastByCity).toHaveBeenCalledWith('Nairobi');
      expect(result).toEqual(mockForecast);
    });

    it('should throw an error if city is invalid', async () => {
      weatherService.getForecastByCity.mockRejectedValue(
        new Error('City not found'),
      );

      await expect(resolver.getForecast('UnknownCity')).rejects.toThrow(
        'City not found',
      );

      expect(weatherService.getForecastByCity).toHaveBeenCalledWith(
        'UnknownCity',
      );
    });
  });
});
