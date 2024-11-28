// src/trust-score/dto/update-trust-score.dto.ts

import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class UpdateTrustScoreDto {
  @IsInt()
  @IsNotEmpty()
  toUserId: number; // 점수를 받는 사용자 프로필 ID

  @IsInt()
  @Min(-5)
  @Max(5)
  score: number; // -5에서 5까지의 점수
}
