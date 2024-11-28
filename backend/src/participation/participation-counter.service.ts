// src/participation/participation-counter.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ParticipationCounterService {
  constructor(private readonly prisma: PrismaService) {}

  // 참여자 수와 총 구매량 증가
  async incrementCounter(
    postId: number,
    quantity: number,
    prisma: Prisma.TransactionClient,
  ) {
    await prisma.participationCounter.upsert({
      where: { postId },
      update: {
        count: { increment: 1 },
        totalQuantity: { increment: quantity },
      },
      create: {
        postId,
        count: 1,
        totalQuantity: quantity,
      },
    });
  }

  // 참여자 수와 총 구매량 감소
  async decrementCounter(
    postId: number,
    quantity: number,
    prisma: Prisma.TransactionClient,
  ) {
    await prisma.participationCounter.update({
      where: { postId },
      data: {
        count: { decrement: 1 },
        totalQuantity: { decrement: quantity },
      },
    });
  }

  // 특정 게시글의 참여 카운터 조회
  async getParticipationCount(postId: number) {
    return this.prisma.participationCounter.findUnique({ where: { postId } });
  }
}
