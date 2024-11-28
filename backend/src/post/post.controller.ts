// src/post/post.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AwsService } from '../aws/aws.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly awsService: AwsService,
  ) {}

  // 모든 게시글 조회 (인증 필요 없음)
  @Get()
  async getAllPosts() {
    return this.postService.getAllPosts();
  }

  // 특정 게시글 조회 (인증 필요 없음)
  @Get('id/:id')
  async getPost(@Param('id') id: number) {
    return this.postService.getPostById(id);
  }

  // 제목 및 내용 검색 기능 (인증 필요 없음)
  @Get('search')
  async searchPosts(@Query('keyword') keyword: string) {
    return this.postService.searchPosts(keyword);
  }

  // Type으로 게시글 검색 기능 (인증 필요 없음)
  @Get('search/type')
  async searchPostsByType(@Query('type') type: string) {
    return this.postService.searchPostsByType(type);
  }

  @Get('recent/:num')
  async getRecentPosts(@Param('num') num: number) {
    return this.postService.getRecentPosts(num);
  }

  // 사용자 참여 게시글 조회 API
  @UseGuards(JwtAuthGuard) // 인증 필요
  @Get('participations/:userId') // 특정 사용자의 참여 게시글 조회
  async getUserParticipations(@Param('userId') userId: number) {
    return this.postService.getUserParticipations(userId); // 서비스 호출
  }

  // 게시글 생성 (인증 필요)
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;

    let imageUrl = null;
    if (file) {
      imageUrl = await this.awsService.uploadFile(
        file.buffer, // 파일 데이터
        'posts', // S3 폴더 이름
        file.mimetype, // 파일 MIME 타입
      );
    }

    return this.postService.createPost(createPostDto, userId, imageUrl);
  }

  // 게시글 수정 (인증 필요, 작성자만 접근 가능)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async updatePost(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    await this.checkPostOwnership(id, userId);

    let imageUrl = null;
    if (file) {
      imageUrl = await this.awsService.uploadFile(
        file.buffer,
        'posts',
        file.mimetype,
      );
    }

    return this.postService.updatePost(id, updatePostDto, imageUrl);
  }

  // 게시글 삭제 (인증 필요, 작성자만 접근 가능)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') id: number, @Request() req) {
    const userId = req.user.userId;
    await this.checkPostOwnership(id, userId);
    return this.postService.deletePost(id);
  }

  // 게시글 소유권 확인 로직
  private async checkPostOwnership(postId: number, userId: number) {
    const post = await this.postService.getPostById(postId);
    if (post.authorId !== userId) {
      throw new ForbiddenException('You do not have access to this post');
    }
  }
}
