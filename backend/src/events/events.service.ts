import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(activeOnly: boolean = false) {
    return this.prisma.event.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { startDate: 'asc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            studentProfile: {
              include: { user: true, department: true },
            },
          },
        },
      },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async create(dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title.trim(),
        description: dto.description.trim(),
        organizer: dto.organizer.trim(),
        venue: dto.venue.trim(),
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        deadline: new Date(dto.deadline),
        requiresDocument: dto.requiresDocument ?? true,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: Partial<CreateEventDto>) {
    await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title.trim() }),
        ...(dto.description && { description: dto.description.trim() }),
        ...(dto.organizer && { organizer: dto.organizer.trim() }),
        ...(dto.venue && { venue: dto.venue.trim() }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate && { endDate: new Date(dto.endDate) }),
        ...(dto.deadline && { deadline: new Date(dto.deadline) }),
        ...(dto.requiresDocument !== undefined && { requiresDocument: dto.requiresDocument }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async toggleActive(id: string) {
    const event = await this.findOne(id);
    return this.prisma.event.update({
      where: { id },
      data: { isActive: !event.isActive },
    });
  }
}
