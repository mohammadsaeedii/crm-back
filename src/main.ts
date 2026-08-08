import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const rootDomain = config.get<string>('ROOT_DOMAIN', 'localhost');
  const corsOrigins = config.get<string>('CORS_ORIGINS', '');

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (corsOrigins === '*') {
        callback(null, true);
        return;
      }

      if (corsOrigins) {
        const allowed = corsOrigins.split(',').map((o) => o.trim());
        if (allowed.includes(origin)) {
          callback(null, true);
          return;
        }
      }

      try {
        const { hostname } = new URL(origin);
        if (
          hostname === rootDomain ||
          hostname === `www.${rootDomain}` ||
          hostname.endsWith(`.${rootDomain}`) ||
          hostname === 'localhost' ||
          hostname.endsWith('.localhost')
        ) {
          callback(null, true);
          return;
        }
      } catch {
        // ignore invalid origin
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = config.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`API listening on port ${port}`);
}
bootstrap();
