/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerFilePath = path.join(__dirname, '../swagger.yml');
  const swaggerDocument = YAML.parse(
    fs.readFileSync(swaggerFilePath, 'utf8'),
  ) as OpenAPIObject;
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
