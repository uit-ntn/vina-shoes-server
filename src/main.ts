import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as morgan from 'morgan';
import * as express from 'express';

// Add type declaration for HMR
declare const module: NodeModule & { hot?: { accept: () => void; dispose: (cb: () => void) => void } };

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Allow access to rawBody for Stripe webhook verification
    rawBody: true
  } as any);
  
  // Expose raw body on request (for Stripe webhook)
  app.use((req: any, res: any, next: any) => {
    // Nest with rawBody option attaches rawBody automatically; ensure it exists
    if (req.rawBody) return next();
    let data = '';
    req.on('data', (chunk: any) => { data += chunk; });
    req.on('end', () => { req.rawBody = data; next(); });
  });
  
  // Add morgan logging middleware
  app.use(morgan(':method :url :status :response-time ms - :res[content-length] bytes'));
  
  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Vina Shoes API')
    .setDescription('The Vina Shoes API Documentation')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    })
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('products', 'Product management endpoints')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  
  // Add custom Swagger options with expanded doc
  const customOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: -1, // Completely hide schemas section
      defaultModelExpandDepth: -1,   // Hide model details
      displayRequestDuration: true
    },
    customSiteTitle: 'Vina Shoes API Docs',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui section.models { display: none !important } 
      .swagger-ui .models { display: none !important }
      body .swagger-ui .opblock-tag-section { margin-bottom: 10px }
    `
  };
  
  SwaggerModule.setup('api-docs', app, document, customOptions);

  // Enable HMR
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
}
bootstrap();
