import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepo.create({
      email,
      password: hashedPassword,
    });
    await this.userRepo.save(newUser);

    return {
      message: 'Registration successful.',
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.generateRefreshToken(user.id.toString());

    return { accessToken, refreshToken };
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const decoded = this.jwtService.verify(oldRefreshToken);
      const user = await this.userRepo.findOne({ where: { id: decoded.sub } });
      if (!user) throw new Error('User not found');

      const newAccessToken = this.jwtService.sign(
        { email: user.email, sub: user.id },
        { expiresIn: '1h' },
      );
      const newRefreshToken = this.generateRefreshToken(user.id.toString());

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async forgotPassword(userId: string, newPassword: string) {
    const user = await this.userRepo.findOne({
      where: { id: parseInt(userId, 10) },
    });
    if (!user) throw new Error('User not found');

    if (!newPassword || newPassword.trim() === '') {
      throw new Error('New password is required');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10); // Ensure `newPassword` is valid
    user.password = hashedPassword;
    await this.userRepo.save(user);

    return { message: 'Password updated successfully' };
  }

  async resetPassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepo.findOne({
      where: { id: parseInt(userId, 10) },
    });

    if (!user || !(await bcrypt.compare(oldPassword, user.password))) {
      throw new Error('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepo.save(user);

    return { message: 'Password reset successfully.' };
  }

  private generateRefreshToken(userId: string) {
    return this.jwtService.sign({ sub: userId }, { expiresIn: '7d' });
  }
}
