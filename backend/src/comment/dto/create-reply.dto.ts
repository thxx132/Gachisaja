// src/comment/dto/create-reply.dto.ts

import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateReplyDto {
  @IsInt()
  @IsNotEmpty()
  postId: number;

  @IsInt()
  @IsNotEmpty()
  parentCommentId: number; // 부모 댓글 ID

  @IsString()
  @IsNotEmpty()
  content: string;
}
