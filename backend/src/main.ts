import 'dotenv/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import {
  isProduction,
  getCorsOrigins,
  requireEnv,
  validateRazorpayKeySafety,
  validateRazorpayWebhookSecret,
} from './config/env';

const SWAGGER_PATH = 'api-docs';

/**
 * Must stay in step with the multer destination in upload.controller.ts, which
 * writes to './uploads' relative to the working directory. Resolved from
 * process.cwd() rather than __dirname so it points at backend/uploads in both
 * `nest start` and `node dist/main` runs.
 */
const UPLOADS_DIR = 'uploads';

/**
 * Allowed browser origins come solely from CORS_ORIGINS. No origin is ever
 * hardcoded here, so a production build carries no environment-specific URLs
 * and cannot silently fall back to a development host.
 */
function resolveAllowedOrigins(logger: Logger): string[] {
  const configured = getCorsOrigins();

  if (configured.length > 0) {
    return configured;
  }

  logger.error(
    'CORS_ORIGINS is not set. All cross-origin browser requests will be rejected.',
  );

  return [];
}

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
  // Upload URLs are persisted into product/brand/category rows, so a missing
  // value would write permanently broken links. Checked here as well as at the
  // point of use so the failure surfaces at boot, not on the first upload.
  requireEnv('UPLOAD_URL');
  validateRazorpayKeySafety();
  validateRazorpayWebhookSecret();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  applyTrustProxy(app, logger);

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
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
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

  app.useStaticAssets(join(process.cwd(), UPLOADS_DIR), {
    prefix: `/${UPLOADS_DIR}`,
    // No directory listing and no implicit index file.
    index: false,
    // Never serve dotfiles that happen to land in the folder.
    dotfiles: 'deny',
    redirect: false,
  });

  const swaggerEnabled =
    !isProduction() || process.env.SWAGGER_ENABLED === 'true';

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Bharath National Computers API')
      .setDescription(
        'API documentation for the Bharath National Computers application',
      )
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
