// src/trust-score/trust-score.controller.ts

import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { TrustScoreService } from './trust-score.service';
import { UpdateTrustScoreDto } from './dto/update-trust-score.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('trust-score')
export class TrustScoreController {
  constructor(private readonly trustScoreService: TrustScoreService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async updateTrustScore(
    @Body() updateTrustScoreDto: UpdateTrustScoreDto,
    @Request() req,
  ) {
    const fromUserId = req.user.userId;
    const { toUserId, score } = updateTrustScoreDto;

    // 자기 자신에게 점수를 줄 수 없음
    if (fromUserId === toUserId) {
      throw new BadRequestException('You cannot rate yourself');
    }

    // 같은 거래에 참여했는지 확인
    const participatedTogether =
      await this.trustScoreService.checkParticipation(fromUserId, toUserId);
    if (!participatedTogether) {
      throw new BadRequestException(
        'Both users must have participated in the same post',
      );
    }

    // 중복 점수 방지 확인
    const existingTrustScore =
      await this.trustScoreService.findExistingTrustScore(fromUserId, toUserId);
    if (existingTrustScore) {
      throw new BadRequestException('You have already rated this user');
    }

    // 점수 업데이트 요청, score 값을 포함하여 호출
    return this.trustScoreService.updateTrustScore(fromUserId, toUserId, score);
  }
}
