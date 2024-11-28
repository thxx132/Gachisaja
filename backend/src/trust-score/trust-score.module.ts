// src/trust-score/trust-score.module.ts

import { Module } from '@nestjs/common';
import { TrustScoreService } from './trust-score.service';
import { TrustScoreController } from './trust-score.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TrustScoreController],
  providers: [TrustScoreService, PrismaService],
})
export class TrustScoreModule {}
