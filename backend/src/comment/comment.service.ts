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

    // 게시글 내 가장 높은 order 값을 가져와 +1 설정
    const maxOrder = await this.prisma.comment.findFirst({
      where: { postId },
      orderBy: { order: 'desc' },
    });

    const newOrder = (maxOrder?.order ?? 0) + 1;

    const comment = await this.prisma.comment.create({
      data: {
        postId: postId,
        commentAuthorId: userId,
        content,
        class: 0, // 원댓글은 class가 0
        order: newOrder, // 게시글 내 가장 마지막 위치
        groupNum: null, // 부모가 없으므로 groupNum은 null
      },
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

    // 부모 댓글의 order 바로 뒤에 위치
    const replyOrder = parentComment.order + 1;

    // 같은 게시글에서 대댓글 이후의 order 값을 +1씩 증가시킴 (order 충돌 방지)
    await this.prisma.comment.updateMany({
      where: {
        postId,
        order: { gte: replyOrder }, // 부모 댓글 이후의 모든 댓글
      },
      data: { order: { increment: 1 } }, // order를 1씩 증가
    });

    const reply = await this.prisma.comment.create({
      data: {
        postId,
        commentAuthorId: userId,
        content,
        class: parentComment.class + 1, // 부모 댓글의 class + 1
        order: replyOrder, // 부모 댓글 바로 아래
        groupNum: parentComment.id, // 부모 댓글 ID를 groupNum으로 설정
      },
    });

    return reply;
  }

  // 특정 게시글의 모든 댓글 조회
  async getCommentsByPost(postId: number) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException(`Post with ID ${postId} not found`);

    // order로 정렬하여 댓글 목록 반환
    return this.prisma.comment.findMany({
      where: { postId },
      orderBy: { order: 'asc' }, // order 기준 정렬
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
      // 댓글 조회
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      // 댓글 존재 확인
      if (!comment) {
        console.error('Comment not found for ID:', commentId);
        throw new NotFoundException('Comment not found');
      }

      // 대댓글 삭제 (groupNum 기준)
      const childComments = await prisma.comment.findMany({
        where: { groupNum: comment.id },
      });

      if (childComments.length > 0) {
        console.log('Deleting child comments:', childComments);
        await prisma.comment.deleteMany({
          where: { groupNum: comment.id },
        });
      }

      // 부모 댓글 삭제
      await prisma.comment.delete({
        where: { id: commentId },
      });

      console.log('Comment deleted successfully:', commentId);
    });
  }
}
