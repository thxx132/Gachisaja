// src/participation/dto/cancel-participation.dto.ts

import { IsInt, IsNotEmpty } from 'class-validator';

export class CancelParticipationDto {
  @IsInt()
  @IsNotEmpty()
  postId: number;
}
