// src/post/post.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ConfigService } from '@nestjs/config'; // ConfigService 추가

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService, // ConfigService 주입
  ) {}

  // 모든 게시글 조회
  async getAllPosts() {
    return this.prisma.post.findMany();
  }

  // 특정 게시글 조회
  async getPostById(id: number) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);
    return post;
  }

  //특정 개수의 최신 post 조회
  async getRecentPosts(num: number) {
    return this.prisma.post.findMany({
      select: {
        // 수정된 부분: select를 통해 필요한 모든 필드 선택
        id: true,
        title: true,
        content: true,
        imageUrl: true, // 추가
        deadline: true, // 추가
        author: {
          // authorId 대신 author 객체에서 nickname 가져오기
          select: {
            nickname: true, // nickname만 가져옴
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: num, // 최신 글 num개만 반환
    });
  }

  // user가 참여한 post
  async getUserParticipations(userId: number) {
    return this.prisma.participation.findMany({
      where: { userId }, // 특정 사용자 ID 기반 검색
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            imageUrl: true,
            deadline: true,
            author: {
              // authorId 대신 author 객체에서 nickname 가져오기
              select: {
                nickname: true, // nickname만 가져옴
              },
            },
          },
        },
      },
    });
  }

  // 제목 및 내용 검색 기능
  async searchPosts(keyword: string) {
    return this.prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      },
    });
  }

  // Type으로 게시글 검색 기능
  async searchPostsByType(type: string) {
    return this.prisma.post.findMany({
      where: {
        type: type,
      },
    });
  }

  // 게시글 생성
  async createPost(
    createPostDto: CreatePostDto,
    userId: number,
    imageUrl: string | null,
  ) {
    // 수정된 부분: 기본 이미지 URL 설정
    const defaultImageUrl = this.configService.get<string>('DEFAULT_IMAGE_URL');
    const finalImageUrl = imageUrl || defaultImageUrl;

    return this.prisma.post.create({
      data: {
        ...createPostDto,
        authorId: userId,
        imageUrl: finalImageUrl,
      },
    });
  }

  // 게시글 수정
  async updatePost(
    id: number,
    updatePostDto: UpdatePostDto,
    imageUrl: string | null,
  ) {
    const post = await this.getPostById(id);
    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);
    return this.prisma.post.update({
      where: { id },
      data: {
        ...updatePostDto,
        imageUrl: imageUrl || post.imageUrl,
      },
    });
  }

  // 게시글 삭제
  async deletePost(id: number) {
    const post = await this.getPostById(id);
    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);
    return this.prisma.post.delete({ where: { id } });
  }
}
