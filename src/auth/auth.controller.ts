import { Controller, Post, Body, Query, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile() {
    return { message: 'This is a protected route' };
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string; newPassword: string }) {
    return this.authService.forgotPassword(body.email, body.newPassword);
  }

  @Post('reset-password')
  @UseGuards(AuthGuard('jwt'))
  async resetPassword(
    @Body() body: { oldPassword: string; newPassword: string },
    @Query('userId') userId: string,
  ) {
    return this.authService.resetPassword(
      userId,
      body.oldPassword,
      body.newPassword,
    );
  }
}
