import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    // 모듈이 초기화될 때 Prisma 클라이언트를 연결합니다.
    async onModuleInit() {
        await this.$connect();
    }

    // 모듈이 종료될 때 Prisma 클라이언트 연결을 해제합니다.
    async onModuleDestroy() {
        await this.$disconnect();
    }

    // 트랜잭션을 위한 메서드: 여러 서비스 간에서 트랜잭션을 관리할 수 있도록 추가
    async transaction<T>(
        operations: (prisma: PrismaClient) => Promise<T>,
    ): Promise<T> {
        return await this.$transaction(operations);
    }
}
