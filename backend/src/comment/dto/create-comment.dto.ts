// src/comment/dto/create-comment.dto.ts

import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import {Type} from "class-transformer";

export class CreateCommentDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  postId: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
