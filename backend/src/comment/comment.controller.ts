// src/comment/comment.controller.ts

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 원댓글 생성
  @UseGuards(JwtAuthGuard)
  @Post()
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.commentService.createComment(createCommentDto, userId);
  }

  // 대댓글 생성
  @UseGuards(JwtAuthGuard)
  @Post('reply')
  async createReply(@Body() createReplyDto: CreateReplyDto, @Request() req) {
    const userId = req.user.userId;
    return this.commentService.createReply(createReplyDto, userId);
  }

  // 특정 게시글의 모든 댓글 조회
  @Get(':postId')
  async getCommentsByPost(@Param('postId') postId: number) {
    return this.commentService.getCommentsByPost(postId);
  }

  // 댓글 수정
  @UseGuards(JwtAuthGuard)
  @Put(':commentId')
  async updateComment(
    @Param('commentId') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    const userId = req.user.userId;

    // 작성자 검증을 컨트롤러에서 수행
    const comment = await this.commentService.getCommentById(commentId);
    if (comment.commentAuthorId !== userId) {
      throw new BadRequestException(
        'Unauthorized: Only the author can modify this comment',
      );
    }

    return this.commentService.updateComment(commentId, updateCommentDto);
  }

  // 댓글 삭제
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: number, @Request() req) {
    const userId = req.user.userId;

    // 작성자 검증을 컨트롤러에서 수행
    const comment = await this.commentService.getCommentById(commentId);
    if (comment.commentAuthorId !== userId) {
      throw new BadRequestException(
        'Unauthorized: Only the author can delete this comment',
      );
    }

    return this.commentService.deleteComment(commentId);
  }
}
