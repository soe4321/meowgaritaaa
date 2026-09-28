import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { StudentLoginDto } from './dto/student-login.dto';
import { FacultyLoginDto } from './dto/faculty-login.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async studentLogin(dto: StudentLoginDto) {
    const trimmedIdentifier = dto.identifier.trim();

    // Query user by email OR by studentProfile.registerNumber
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: trimmedIdentifier, mode: 'insensitive' } },
          { studentProfile: { registerNumber: { equals: trimmedIdentifier, mode: 'insensitive' } } },
        ],
      },
      include: {
        studentProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid student register number or credentials');
    }

    if (user.role !== UserRole.STUDENT) {
      throw new UnauthorizedException('Account is not authorized for student portal. Use faculty portal.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        studentProfile: user.studentProfile,
      },
    };
  }

  async facultyLogin(dto: FacultyLoginDto) {
    const trimmedEmail = dto.email.trim();

    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: trimmedEmail, mode: 'insensitive' },
      },
      include: {
        facultyProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.role !== UserRole.FACULTY && user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Access denied: Only faculty and administrators may log in here');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        facultyProfile: user.facultyProfile,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: { department: true },
        },
        facultyProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
