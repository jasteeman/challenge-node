import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/domain/entities/user.entity';
import { TransferenciaModule } from './transferencia/transferencia.module';
import { Transferencia } from './transferencia/domain/entities/transferencia.entity';
import { Empresa } from './transferencia/domain/entities/empresa.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [User,Transferencia,Empresa],
        synchronize: true,
        logging: true,
      }),
    }),
    UsersModule,
    AuthModule,
    TransferenciaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}