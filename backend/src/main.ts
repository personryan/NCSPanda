import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req: Request, _res: Response, next: NextFunction) => {
    const apiRoutes = ['/admin', '/health', '/menu', '/orders', '/pickup-slots', '/reports', '/users', '/vendor'];
    if (apiRoutes.some((route) => req.url === route || req.url.startsWith(`${route}/`) || req.url.startsWith(`${route}?`))) {
      req.url = `/api${req.url}`;
    }
    next();
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const corsOrigins = (process.env.CORS_ORIGIN ?? process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
