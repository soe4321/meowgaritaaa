import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { students: true, faculty: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: {
        students: { include: { user: true } },
        faculty: { include: { user: true } },
      },
    });
  }

  async create(data: { code: string; name: string }) {
    return this.prisma.department.create({
      data: {
        code: data.code.toUpperCase().trim(),
        name: data.name.trim(),
      },
    });
  }
}
