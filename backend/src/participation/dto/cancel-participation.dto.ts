// src/participation/dto/cancel-participation.dto.ts

import { IsInt, IsNotEmpty } from 'class-validator';
import {Type} from "class-transformer";

export class CancelParticipationDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  postId: number;
}
