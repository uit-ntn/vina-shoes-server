import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application running on port ${port}`);
  console.log(`API documentation available at http://localhost:${port}/api-docs`);
}
bootstrap();
