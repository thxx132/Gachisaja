import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { ParticipationModule } from './participation/paticipation.module';
import { TrustScoreModule } from './trust-score/trust-score.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule, // 인증 모듈
    UserModule, // 사용자 및 프로필 모듈
    PostModule, // 게시글 모듈
    CommentModule, // 댓글 모듈
    ParticipationModule, // 참여 및 참여자 수 모듈
    TrustScoreModule, // 신뢰 점수 모듈
    PrismaModule, // Prisma ORM 모듈
    ConfigModule.forRoot({
      envFilePath: './src/.env',
      isGlobal: true, // 모든 모듈에서 환경 변수를 접근 가능하게 함
    }),
  ],
})
export class AppModule {}
