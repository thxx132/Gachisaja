// src/participation/participation-counter.controller.ts

import { Controller, Get, Param } from '@nestjs/common';
import { ParticipationCounterService } from './participation-counter.service';

@Controller('participation-counter')
export class ParticipationCounterController {
  constructor(
    private readonly participationCounterService: ParticipationCounterService,
  ) {}

  // 특정 게시글의 참여 카운터 조회
  @Get(':postId')
  async getParticipationCount(@Param('postId') postId: number) {
    return this.participationCounterService.getParticipationCount(postId);
  }
}
