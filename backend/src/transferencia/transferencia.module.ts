import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferenciaController } from './infrastructure/controllers/transferencia.controller';
import { Transferencia } from './domain/entities/transferencia.entity';
import { TransferenciaService } from './application/services/transferencia/transferencia.service';
import { transferenciaProviders } from './transferencia.providers';
import { TransferenciaRepository } from './infrastructure/repositories/transferencia.repository';
import { Empresa } from './domain/entities/empresa.entity';
import { EmpresaController } from './infrastructure/controllers/empresa.controller';
import { EmpresaService } from './application/services/empresa/empresa.service';
import { EmpresaRepository } from './infrastructure/repositories/empresa.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa, Transferencia])],
  controllers: [TransferenciaController, EmpresaController],
  providers: [
    TransferenciaService,
    EmpresaService,
    EmpresaRepository,
    TransferenciaRepository,
    ...transferenciaProviders,
  ],
  exports: [TransferenciaService, EmpresaService],
})
export class TransferenciaModule {}