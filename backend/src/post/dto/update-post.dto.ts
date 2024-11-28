// src/post/dto/update-post.dto.ts

import { IsString, IsOptional, IsInt, IsDateString } from 'class-validator';
import {Type} from "class-transformer";

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  unitQuantity?: number;

  @IsDateString()
  @IsOptional()
  deadline?: string; // ISO 날짜 문자열 형식
}
