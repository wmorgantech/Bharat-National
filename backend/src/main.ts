import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { isProduction, requireEnv } from './config/env';

const SWAGGER_PATH = 'api-docs';

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
];

function resolveAllowedOrigins(logger: Logger): string[] {
  const configured = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured.length > 0) {
    return configured;
  }

  if (isProduction()) {
    logger.error(
      'CORS_ORIGINS is not set. All cross-origin browser requests will be rejected.',
    );
    return [];
  }

  logger.warn(
    `CORS_ORIGINS is not set. Falling back to development origins: ${DEV_ORIGINS.join(', ')}`,
  );
  return DEV_ORIGINS;
}

/**
 * Trust-proxy is OFF unless explicitly configured. Getting this wrong has two
 * failure modes: left unset behind a proxy, every client shares one rate-limit
 * bucket; set to a blanket `true`, X-Forwarded-For becomes attacker-controlled
 * and rate limiting can be bypassed entirely. So it is opt-in and explicit.
 */
function applyTrustProxy(app: NestExpressApplication, logger: Logger): void {
  const raw = (process.env.TRUST_PROXY ?? '0').trim();

  if (raw === '' || raw === '0' || raw.toLowerCase() === 'false') {
    logger.log('trust proxy disabled (client IP taken from the socket)');
    return;
  }

  const hops = Number(raw);
  const value: number | string = Number.isFinite(hops) ? hops : raw;

  app.set('trust proxy', value);
  logger.log(`trust proxy enabled: ${value}`);
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Fail fast rather than starting with an unsigned-in-practice token secret.
  requireEnv('JWT_SECRET');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  applyTrustProxy(app, logger);

  // Security headers. Swagger UI ships inline scripts and styles, which the
  // default CSP blocks, so the docs path gets the same headers minus CSP.
  // CORP is relaxed to cross-origin because this API is consumed by the
  // storefront and admin SPAs from a different origin by design; reads are
  // still governed by the CORS allow-list below.
  const apiHelmet = helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
  const docsHelmet = helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });

  // Refresh tokens arrive as HttpOnly cookies, so the raw Cookie header has to
  // be parsed before the auth routes read them.
  app.use(cookieParser());

  app.use((req: Request, res: Response, next: NextFunction) => {
    const isSwagger =
      req.path === `/${SWAGGER_PATH}` ||
      req.path.startsWith(`/${SWAGGER_PATH}/`) ||
      req.path.startsWith(`/${SWAGGER_PATH}-`);

    return isSwagger ? docsHelmet(req, res, next) : apiHelmet(req, res, next);
  });

  app.useGlobalPipes(
    new ValidationPipe({
      // Strip any property that is not declared on the DTO before it reaches
      // Prisma. This is what prevents mass assignment.
      whitelist: true,
      transform: true,
      validateCustomDecorators: true,
    }),
  );

  const allowedOrigins = resolveAllowedOrigins(logger);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Requests without an Origin header (curl, server-to-server, health
      // checks) are not subject to the browser same-origin policy.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Deny by omitting the CORS headers rather than raising (which would
      // surface as a 500). The browser blocks the cross-origin read either way.
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });

  // API documentation exposes the full route surface, so it stays off in
  // production unless explicitly re-enabled.
  const swaggerEnabled =
    !isProduction() || process.env.SWAGGER_ENABLED === 'true';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Bharath National Computers API')
      .setDescription('API documentation for the Bharath National Computers application')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(SWAGGER_PATH, app, swaggerDocument);
    logger.log(`Swagger UI enabled at /${SWAGGER_PATH}`);
  } else {
    logger.log('Swagger UI disabled (production)');
  }

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  logger.log(`Server listening on port ${port} (production=${isProduction()})`);
}

void bootstrap();
