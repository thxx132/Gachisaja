import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
    providers: [PrismaService],
    exports: [PrismaService], // PrismaService를 다른 모듈에서 사용할 수 있도록 설정
})
export class PrismaModule {}
