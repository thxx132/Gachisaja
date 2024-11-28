// src/trust-score/trust-score.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrustScoreService {
  constructor(private readonly prisma: PrismaService) {}

  async checkParticipation(fromUserId: number, toUserId: number) {
    const participations = await this.prisma.participation.findMany({
      where: {
        userId: { in: [fromUserId, toUserId] },
      },
    });
    return participations.length >= 2;
  }

  async findExistingTrustScore(fromUserId: number, toUserId: number) {
    return this.prisma.trustScore.findFirst({
      where: {
        fromUserId,
        toUserId,
      },
    });
  }

  // 트러스트 점수 업데이트 (score를 활용해 toUserId에 반영)
  async updateTrustScore(fromUserId: number, toUserId: number, score: number) {
    return this.prisma.$transaction(async (prisma) => {
      // TrustScore 테이블에 기록 추가
      await prisma.trustScore.create({
        data: {
          fromUserId,
          toUserId,
          score,
        },
      });

      // toUserId의 trustScore에 score 값 반영
      await prisma.user.update({
        where: { id: toUserId },
        data: {
          trustScore: { increment: score },
        },
      });
    });
  }
}
