import { getCorsOrigins } from './env';

describe('getCorsOrigins', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalCorsOrigins = process.env.CORS_ORIGINS;

  afterEach(() => {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalCorsOrigins === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = originalCorsOrigins;
  });

  it('requires CORS origins in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.CORS_ORIGINS;

    expect(() => getCorsOrigins()).toThrow(
      'CORS_ORIGINS is required in production',
    );
  });

  it('accepts configured public HTTPS origins in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGINS =
      'https://store.example.test,https://admin.example.test/';

    expect(getCorsOrigins()).toEqual([
      'https://store.example.test',
      'https://admin.example.test',
    ]);
  });

  it.each(['http://store.example.test', 'https://localhost:5173'])(
    'rejects insecure or local production origins: %s',
    (origin) => {
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGINS = origin;

      expect(() => getCorsOrigins()).toThrow(
        'Production CORS_ORIGINS entries must use HTTPS and public hostnames',
      );
    },
  );
});
