import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 사용자 로그인 및 JWT 토큰 발급
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
  //원래 jwttoken으로 정보 불러와서 그대로 다시 로그인하게 하려했지만,
  //bcrypt가 복호화가 안되어서 다른 방법을 사용해야할듯. 근데 너무 늦게 발견함
  // @UseGuards(JwtAuthGuard)
  // @Post('relogin')
  // async relogin(@Request() req) {
  //   const userId = req.user.userId;
  //   return this.authService.relogin(userId);
  // }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user; // JwtStrategy에서 설정한 사용자 정보를 반환
  }
}
