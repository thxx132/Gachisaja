// src/post/post.module.ts

import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { JwtModule } from '@nestjs/jwt';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [JwtModule, AwsModule], // 인증에 필요한 JwtModule 설정
  controllers: [PostController],
  providers: [PostService, PrismaService, JwtAuthGuard],
})
export class PostModule {}
