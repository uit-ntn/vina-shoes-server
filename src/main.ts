import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as morgan from 'morgan';
import * as express from 'express';

declare const module: NodeModule & { hot?: { accept: () => void; dispose: (cb: () => void) => void } };

// helper: parse danh sách từ ENV
function parseEnvList(name: string, fallback: string[] = []) {
  const raw = process.env[name];
  if (!raw) return fallback;
  
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false }); // tắt auto-cors để tự cấu hình

  // logging
  app.use(morgan(':method :url :status :response-time ms - :res[content-length] bytes'));

  // validation + filter
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  // ===== CORS chuẩn production (whitelist từ ENV) =====
  const defaultOrigins = [
    'https://www.vinashoes.org',
    'https://vinashoes.org',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  const whitelist = parseEnvList('CORS_ORIGINS', defaultOrigins);
  const allowCreds = String(process.env.CORS_CREDENTIALS || 'true') === 'true';

  console.log('CORS Origins:', whitelist);
  console.log('CORS Credentials:', allowCreds);

  app.enableCors({
    origin: (origin, cb) => {
      // Cho phép Postman/cURL không gửi Origin
      if (!origin) return cb(null, true);
      if (whitelist.length === 0 || whitelist.includes(origin)) return cb(null, true);
      console.warn(`CORS blocked for origin: ${origin}`);
      return cb(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: allowCreds,
    maxAge: 86400, // preflight cache 24h
  });

  // Swagger (giữ nguyên phần của anh)
  const config = new DocumentBuilder()
    .setTitle('Vina Shoes API')
    .setDescription('The Vina Shoes API Documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' })
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('products', 'Product management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const customOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: -1,
      displayRequestDuration: true,
    },
    customSiteTitle: 'Vina Shoes API Docs',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui section.models { display: none !important }
      .swagger-ui .models { display: none !important }
      body .swagger-ui .opblock-tag-section { margin-bottom: 10px }
    `,
  };
  SwaggerModule.setup('api-docs', app, document, customOptions);

  // Health endpoint đơn giản (cho LB/UptimeRobot)
  const server = app.getHttpAdapter().getInstance();
  server.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  // HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
}
bootstrap();
