import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllStudents(departmentId?: string) {
    return this.prisma.studentProfile.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: {
        user: {
          select: { id: true, email: true, fullName: true, phone: true, createdAt: true },
        },
        department: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { registerNumber: 'asc' },
    });
  }

  async findAllFaculty(departmentId?: string) {
    return this.prisma.facultyProfile.findMany({
      where: departmentId ? { departmentId } : undefined,
      include: {
        user: {
          select: { id: true, email: true, fullName: true, phone: true, createdAt: true },
        },
        department: true,
      },
      orderBy: { employeeId: 'asc' },
    });
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        createdAt: true,
        studentProfile: {
          include: { department: true },
        },
        facultyProfile: {
          include: { department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
