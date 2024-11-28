import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 전역 ValidationPipe 설정: DTO 유효성 검사 활성화
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의된 속성 외의 속성은 제거
      forbidNonWhitelisted: true, // 정의되지 않은 속성이 들어오면 에러 발생
      transform: true, // 요청 데이터를 DTO 클래스 인스턴스로 변환
    }),
  );

  app.enableCors();

  // 포트 설정 및 서버 시작
  await app.listen(3000);
}
bootstrap();
