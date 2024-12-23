// src/user/user.service.ts

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly awsService: AwsService,
  ) {}

  // 새로운 사용자를 생성하며, 비밀번호를 bcrypt로 암호화하여 저장
  async createUser(createUserDto: CreateUserDto, imageUrl: string | null) {
    // 이메일과 닉네임 중복 확인
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: createUserDto.email },
          { nickname: createUserDto.nickname },
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('The email or nickname is already in use.');
    }

    const defaultprofileImageUrl = this.configService.get(
      'DEFAULT_PROFILE_IMAGE_URL',
    );
    const profileImageUrl = imageUrl || defaultprofileImageUrl;

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        profileImageUrl,
      },
    });
  }

  // 모든 사용자 조회
  async getAllUsers() {
    return this.prisma.user.findMany();
  }

  // ID로 사용자를 조회하며, 존재하지 않을 경우 예외를 발생
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  // ID로 사용자를 조회하여 정보 업데이트, 사용자 존재 여부를 확인 후 진행
  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    if (file) {
      const uploadedImageUrl = await this.awsService.uploadFile(
        file.buffer,
        'user-profiles',
        file.mimetype,
      );
      updateUserDto.profileImageUrl = uploadedImageUrl; // 파일 URL 업데이트
    }

    // 중복 검사 조건 생성
    const checkConditions = [];
    if (updateUserDto.email) {
      checkConditions.push({ email: updateUserDto.email });
    }
    if (updateUserDto.nickname) {
      checkConditions.push({ nickname: updateUserDto.nickname });
    }

    // 중복 검사 실행 (조건이 있을 때만)
    if (checkConditions.length > 0) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          id: { not: id }, // 자신의 데이터 제외
          OR: checkConditions,
        },
      });

      if (existingUser) {
        throw new ConflictException(
          'The email or nickname is already in use by another user.',
        );
      }
    }

    // 유저 정보 업데이트
    const filteredUpdateUserDto = Object.fromEntries(
      Object.entries(updateUserDto).filter(([_, value]) => value != null),
    );

    return this.prisma.user.update({
      where: { id },
      data: filteredUpdateUserDto,
    });
  }

  // ID로 사용자를 조회하여 삭제하며, 존재하지 않을 경우 예외를 발생
  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return this.prisma.user.delete({ where: { id } });
  }
}
