// src/comment/comment.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  // 특정 댓글을 ID로 조회 (작성자 검증용)
  async getCommentById(commentId: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  // 원댓글 생성
  async createComment(createCommentDto: CreateCommentDto, userId: number) {
    const { postId, content } = createCommentDto;

    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        commentAuthorId: userId,
        content,
        class: 0,
        order: 0,
        groupNum: 0,
      },
    });

    await this.prisma.comment.update({
      where: { id: comment.id },
      data: { groupNum: comment.id },
    });

    return comment;
  }

  // 대댓글 생성
  async createReply(createReplyDto: CreateReplyDto, userId: number) {
    const { postId, parentCommentId, content } = createReplyDto;

    const parentComment = await this.prisma.comment.findUnique({
      where: { id: parentCommentId },
    });
    if (!parentComment) throw new NotFoundException('Parent comment not found');

    const maxOrderInGroup = await this.prisma.comment.findFirst({
      where: { groupNum: parentComment.groupNum },
      orderBy: { order: 'desc' },
    });
    const newOrder = (maxOrderInGroup?.order ?? 0) + 1;

    const reply = await this.prisma.comment.create({
      data: {
        postId,
        commentAuthorId: userId,
        content,
        class: parentComment.class + 1,
        order: newOrder,
        groupNum: parentComment.groupNum,
      },
    });

    return reply;
  }

  // 특정 게시글의 모든 댓글 조회
  async getCommentsByPost(postId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { order: 'asc' },
    });
  }

  // 댓글 내용 수정 (컨트롤러에서 작성자 확인 후 호출)
  async updateComment(commentId: number, updateCommentDto: UpdateCommentDto) {
    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: updateCommentDto.content },
    });
  }

  // 댓글 삭제 (컨트롤러에서 작성자 확인 후 호출)
  async deleteComment(commentId: number) {
    return this.prisma.$transaction(async (prisma) => {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });
      if (!comment) throw new NotFoundException('Comment not found');

      await prisma.comment.deleteMany({
        where: { groupNum: comment.groupNum, class: { gt: 0 } },
      });
      await prisma.comment.delete({ where: { id: commentId } });
    });
  }
}
