// src/participation/participation.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { CancelParticipationDto } from './dto/cancel-participation.dto';
import { ParticipationCounterService } from './participation-counter.service';

@Injectable()
export class ParticipationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly participationCounterService: ParticipationCounterService,
  ) {}

  // 참여 기능 (트랜잭션 적용 및 중복 참여 방지)
  async participate(
    createParticipationDto: CreateParticipationDto,
    userId: number,
  ) {
    const { postId, quantity } = createParticipationDto;

    // 중복 참여 방지
    const existingParticipation = await this.prisma.participation.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });
    if (existingParticipation) {
      throw new BadRequestException(
        `You have already participated in post ${postId}`,
      );
    }

    // post 없을 때 에러
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post)
      throw new BadRequestException(`Post with ID ${postId} not found`);
    // deadline 지났을 때 에러
    if (post.deadline && new Date(post.deadline) < new Date()) {
      throw new BadRequestException('Participation is closed for this post.');
    }
    // quantity가 unitquantity의 배수가 아닐 때 에러
    if (quantity % post.unitQuantity !== 0) {
      throw new BadRequestException(
        `Quantity must be a multiple of ${post.unitQuantity}`,
      );
    }

    // 트랜잭션을 사용하여 참여 기록 생성 및 카운터 업데이트를 원자적으로 처리
    await this.prisma.$transaction(async (prisma) => {
      await prisma.participation.create({
        data: {
          postId,
          userId,
          quantity,
        },
      });

      await this.participationCounterService.incrementCounter(
        postId,
        quantity,
        prisma,
      );
    });
  }

  // 참여 취소 기능 (트랜잭션 적용 및 중복 취소 방지)
  async cancelParticipation(
    cancelParticipationDto: CancelParticipationDto,
    userId: number,
  ) {
    const { postId } = cancelParticipationDto;

    const participation = await this.prisma.participation.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });
    // 취소하려는 participation이 존재하지 않을 때 에러
    if (!participation)
      throw new BadRequestException(
        `No participation found for post ${postId} to cancel`,
      );

    // deadline 지났을 때 에러
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (post.deadline && new Date(post.deadline) < new Date()) {
      throw new BadRequestException(
        'Participation cancellation is closed for this post.',
      );
    }

    await this.prisma.$transaction(async (prisma) => {
      await prisma.participation.delete({
        where: {
          postId_userId: { postId, userId },
        },
      });

      await this.participationCounterService.decrementCounter(
        postId,
        participation.quantity,
        prisma,
      );
    });
  }
}
