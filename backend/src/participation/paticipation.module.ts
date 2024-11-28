// src/participation/participation.module.ts

import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { ParticipationController } from './participation.controller';
import { ParticipationCounterService } from './participation-counter.service';
import { ParticipationCounterController } from './participation-counter.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Module({
  controllers: [ParticipationController, ParticipationCounterController],
  providers: [
    ParticipationService,
    ParticipationCounterService,
    PrismaService,
    JwtAuthGuard,
  ],
})
export class ParticipationModule {}
