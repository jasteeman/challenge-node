import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ErrorLoggingInterceptor } from './common/interceptors/error-logging.interceptor';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: "*",
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    },
  });
  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT') ?? 3000;
  const logger = new Logger('Bootstrap'); // Logger para el proceso de inicio

  // Aplicar filtro de excepción global
  app.useGlobalFilters(new GlobalExceptionFilter());
  logger.log('Filtro de excepción global aplicado.');

  // Aplicar interceptores globales (el orden importa)
  app.useGlobalInterceptors(new TransformInterceptor());
  logger.log('Interceptor de transformación global aplicado.');

  app.useGlobalInterceptors(new ErrorLoggingInterceptor());
  logger.log('Interceptor de logging de errores global aplicado.');

  const config = new DocumentBuilder()
    .setTitle('TP-Empresa API')
    .setDescription('API para la gestión de TP-Empresa')
    .setVersion('1.0')
    .addTag('users')
    .addTag('auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  logger.log('Documentación de Swagger configurada en /api.');

  await app.listen(port);
  logger.log(`La aplicación se está ejecutando en el puerto: ${port}`);
}
bootstrap();