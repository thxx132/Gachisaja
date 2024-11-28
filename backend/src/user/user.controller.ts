// src/user/user.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 새로운 사용자 생성
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  // 모든 사용자 조회
  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  // ID로 특정 사용자 조회
  @Get(':id')
  async getUser(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  // 사용자가 로그인된 상태에서만 자신에 대한 정보 업데이트 가능
  @UseGuards(JwtAuthGuard) // JWT 인증 가드를 사용하여 로그인된 사용자만 접근 허용
  @Patch(':id')
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req, // 로그인된 사용자 정보에 접근하기 위해 요청 객체 사용
    @UploadedFile() file: Express.Multer.File,
  ) {
    const loggedInUserId = req.user.userId; // 현재 로그인된 사용자 ID
    if (loggedInUserId !== Number(id)) {
      throw new UnauthorizedException('You can only update your own profile'); // 본인만 수정할 수 있도록 제한
    }
    return this.userService.updateUser(id, updateUserDto, file);
  }

  // 사용자가 로그인된 상태에서만 자신에 대한 정보 삭제 가능
  @UseGuards(JwtAuthGuard) // JWT 인증 가드를 사용하여 로그인된 사용자만 접근 허용
  @Delete(':id')
  async deleteUser(@Param('id') id: number, @Request() req) {
    const loggedInUserId = req.user.userId; // 현재 로그인된 사용자 ID
    if (loggedInUserId !== Number(id)) {
      throw new UnauthorizedException('You can only delete your own profile'); // 본인만 삭제할 수 있도록 제한
    }
    return this.userService.deleteUser(id);
  }
}
