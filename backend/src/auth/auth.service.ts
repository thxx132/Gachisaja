// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  // 사용자 로그인 및 JWT 토큰 발급
  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { username } });

    // 사용자가 존재하고, 비밀번호가 일치할 때 JWT 토큰 발급
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { username: user.username, sub: user.id };
      return { access_token: this.jwtService.sign(payload) };
    }

    // 인증 실패 시 예외 발생
    throw new UnauthorizedException('Invalid credentials');
  }

  async relogin(userId: number) {
    // 사용자 검증: 데이터베이스에서 사용자가 존재하는지 확인
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 새로운 토큰 생성
    const payload = { username: user.username, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }
}
