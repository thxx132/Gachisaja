// src/participation/participation.controller.ts

import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { CancelParticipationDto } from './dto/cancel-participation.dto';

@Controller('participation')
@UseGuards(JwtAuthGuard)
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  // 참여 기능: 특정 게시글에 대해 참여 요청
  @Post()
  async participate(
    @Body() createParticipationDto: CreateParticipationDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.participationService.participate(
      createParticipationDto,
      userId,
    );
  }

  // 참여 취소 기능: 특정 게시글에 대한 참여 취소 요청
  @Delete()
  async cancelParticipation(
    @Body() cancelParticipationDto: CancelParticipationDto,
    @Request() req,
  ) {
    const userProfileId = req.user.userId;
    return this.participationService.cancelParticipation(
      cancelParticipationDto,
      userProfileId,
    );
  }
}
