// src/participation/dto/create-participation.dto.ts

import { IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateParticipationDto {
  @IsInt()
  @IsNotEmpty()
  postId: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  quantity: number;
}
