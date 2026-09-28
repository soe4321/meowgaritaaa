import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateODApplicationDto } from './dto/create-od-application.dto';
import { FilterODApplicationsDto } from './dto/filter-od-applications.dto';
import { ApplicationStatus, UserRole } from '@prisma/client';

@Injectable()
export class ODApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(studentProfileId: string, dto: CreateODApplicationDto) {
    if (!dto.declarationAccepted) {
      throw new BadRequestException('You must accept the academic integrity declaration to submit an application');
    }

    if (!dto.dates || dto.dates.length === 0) {
      throw new BadRequestException('At least one OD date must be specified');
    }

    // 1. Conflict Detection: check against existing active applications for this student
    const requestedDates = dto.dates.map((d) => ({
      dateStr: new Date(d.date).toISOString().split('T')[0],
      isFullDay: d.isFullDay ?? false,
      periods: d.isFullDay ? [1, 2, 3, 4, 5, 6, 7, 8] : (d.periods || []),
    }));

    // Find any existing active apps (PENDING_FACULTY, PENDING_ADMIN, APPROVED)
    const activeExistingApps = await this.prisma.oDApplication.findMany({
      where: {
        studentProfileId,
        status: {
          in: [ApplicationStatus.PENDING_FACULTY, ApplicationStatus.PENDING_ADMIN, ApplicationStatus.APPROVED],
        },
      },
      include: {
        dates: {
          include: { periods: true },
        },
      },
    });

    for (const reqDate of requestedDates) {
      for (const existingApp of activeExistingApps) {
        for (const existDate of existingApp.dates) {
          const existDateStr = new Date(existDate.date).toISOString().split('T')[0];
          if (existDateStr === reqDate.dateStr) {
            // Same date - check periods
            const existPeriodNumbers = existDate.isFullDay
              ? [1, 2, 3, 4, 5, 6, 7, 8]
              : existDate.periods.map((p) => p.periodNumber);

            const conflictingPeriods = reqDate.periods.filter((p) => existPeriodNumbers.includes(p));
            if (conflictingPeriods.length > 0) {
              throw new BadRequestException(
                `Schedule conflict: You already have an active application (${existingApp.applicationNumber}) on ${reqDate.dateStr} for Period(s): ${conflictingPeriods.join(', ')}`,
              );
            }
          }
        }
      }
    }

    // 2. Generate unique application number and verification code
    let applicationNumber = '';
    let isUniqueNumber = false;
    while (!isUniqueNumber) {
      const random4 = Math.floor(1000 + Math.random() * 9000);
      applicationNumber = `OD-2026-${random4}`;
      const existing = await this.prisma.oDApplication.findUnique({ where: { applicationNumber } });
      if (!existing) isUniqueNumber = true;
    }

    const verificationCode = `VER-OD-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 3. Create application and nested dates/periods
    const application = await this.prisma.oDApplication.create({
      data: {
        applicationNumber,
        studentProfileId,
        eventId: dto.eventId || null,
        customEventTitle: dto.customEventTitle || null,
        customVenue: dto.customVenue || null,
        customOrganizer: dto.customOrganizer || null,
        reason: dto.reason,
        status: ApplicationStatus.PENDING_FACULTY,
        verificationCode,
        declarationAccepted: dto.declarationAccepted,
        dates: {
          create: dto.dates.map((d) => ({
            date: new Date(d.date),
            isFullDay: d.isFullDay ?? false,
            periods: {
              create: (d.isFullDay ? [1, 2, 3, 4, 5, 6, 7, 8] : (d.periods || [])).map((p) => ({
                periodNumber: p,
              })),
            },
          })),
        },
      },
      include: {
        dates: { include: { periods: true } },
        studentProfile: { include: { user: true, department: true } },
      },
    });

    // 4. Link documents if documentIds were provided
    if (dto.documentIds && dto.documentIds.length > 0) {
      await this.prisma.uploadedDocument.updateMany({
        where: { id: { in: dto.documentIds } },
        data: { applicationId: application.id },
      });
    }

    // 5. Notify Faculty in student's department
    const studentDeptId = application.studentProfile.departmentId;
    const departmentFaculty = await this.prisma.facultyProfile.findMany({
      where: { departmentId: studentDeptId },
      include: { user: true },
    });

    for (const faculty of departmentFaculty) {
      await this.prisma.notification.create({
        data: {
          userId: faculty.userId,
          title: 'New OD Request Awaiting Review',
          message: `${application.studentProfile.user.fullName} (${application.studentProfile.registerNumber}) submitted OD application ${application.applicationNumber}.`,
          type: 'SUBMITTED',
          link: `/faculty/review/${application.id}`,
        },
      });
    }

    // 6. Notify Student of submission
    await this.prisma.notification.create({
      data: {
        userId: application.studentProfile.userId,
        title: 'OD Application Submitted',
        message: `Your OD application ${application.applicationNumber} was received and forwarded to your department faculty for review.`,
        type: 'SUBMITTED',
        link: `/applications/${application.id}`,
      },
    });

    return this.findOne(application.id);
  }

  async getMyApplications(studentProfileId: string) {
    return this.prisma.oDApplication.findMany({
      where: { studentProfileId },
      orderBy: { createdAt: 'desc' },
      include: {
        event: true,
        dates: {
          include: { periods: true },
          orderBy: { date: 'asc' },
        },
        reviews: {
          include: { reviewer: true },
          orderBy: { createdAt: 'asc' },
        },
        documents: true,
      },
    });
  }

  async findAll(query: FilterODApplicationsDto, facultyDepartmentId?: string) {
    const { status, reason, departmentId, eventId, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;
    if (reason) where.reason = reason;
    if (eventId) where.eventId = eventId;

    if (departmentId || facultyDepartmentId) {
      where.studentProfile = {
        departmentId: facultyDepartmentId || departmentId,
      };
    }

    if (search) {
      const term = search.trim();
      where.OR = [
        { applicationNumber: { contains: term, mode: 'insensitive' } },
        { customEventTitle: { contains: term, mode: 'insensitive' } },
        { event: { title: { contains: term, mode: 'insensitive' } } },
        { studentProfile: { registerNumber: { contains: term, mode: 'insensitive' } } },
        { studentProfile: { user: { fullName: { contains: term, mode: 'insensitive' } } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.oDApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          event: true,
          studentProfile: {
            include: { user: true, department: true },
          },
          dates: {
            include: { periods: true },
            orderBy: { date: 'asc' },
          },
          reviews: {
            include: { reviewer: true },
            orderBy: { createdAt: 'asc' },
          },
          documents: true,
        },
      }),
      this.prisma.oDApplication.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const application = await this.prisma.oDApplication.findUnique({
      where: { id },
      include: {
        event: true,
        studentProfile: {
          include: {
            user: true,
            department: true,
          },
        },
        dates: {
          include: { periods: true },
          orderBy: { date: 'asc' },
        },
        reviews: {
          include: {
            reviewer: {
              include: { facultyProfile: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        documents: true,
      },
    });

    if (!application) {
      throw new NotFoundException(`OD Application ${id} not found`);
    }

    return application;
  }

  async cancelApplication(id: string, userId: string, role: UserRole) {
    const application = await this.findOne(id);

    if (role === UserRole.STUDENT && application.studentProfile.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own applications');
    }

    if (
      application.status !== ApplicationStatus.PENDING_FACULTY &&
      application.status !== ApplicationStatus.RETURNED_FOR_CORRECTION &&
      application.status !== ApplicationStatus.SUBMITTED
    ) {
      throw new BadRequestException(
        `Application cannot be cancelled in its current state (${application.status})`,
      );
    }

    return this.prisma.oDApplication.update({
      where: { id },
      data: { status: ApplicationStatus.CANCELLED },
      include: {
        event: true,
        dates: { include: { periods: true } },
        reviews: true,
      },
    });
  }
}
