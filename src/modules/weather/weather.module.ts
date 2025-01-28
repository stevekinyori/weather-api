import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { HttpModule } from '@nestjs/axios';
import { ForecastController } from './forecast.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [WeatherController, ForecastController],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
