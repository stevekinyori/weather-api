import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred';
}

export const bcryptValidate = (a: string, b: string): Promise<boolean> => {
  return bcrypt.compare(a, b);
};

export const handleApiError = (error: any, city: string): never => {
  if (error.response) {
    const { status, data } = error.response;

    if (status === 404) {
      throw new BadRequestException(`City ${city} not found.`);
    }

    if (status >= 400 && status < 500) {
      throw new BadRequestException(data?.message || 'Invalid request.');
    }

    if (status >= 500) {
      throw new InternalServerErrorException(
        'Weather service is currently unavailable. Please try again later.',
      );
    }
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : 'Unknown error occurred while fetching weather data';

  console.error(
    `Unexpected error while fetching weather for "${city}":`,
    error,
  );
  throw new InternalServerErrorException(errorMessage);
};
