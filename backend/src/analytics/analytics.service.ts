import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus, UserRole } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAdminOverview() {
    const [
      totalStudents,
      totalFaculty,
      totalApplications,
      pendingFaculty,
      pendingAdmin,
      approved,
      rejected,
      departments,
      events,
    ] = await Promise.all([
      this.prisma.studentProfile.count(),
      this.prisma.facultyProfile.count(),
      this.prisma.oDApplication.count(),
      this.prisma.oDApplication.count({ where: { status: ApplicationStatus.PENDING_FACULTY } }),
      this.prisma.oDApplication.count({ where: { status: ApplicationStatus.PENDING_ADMIN } }),
      this.prisma.oDApplication.count({ where: { status: ApplicationStatus.APPROVED } }),
      this.prisma.oDApplication.count({ where: { status: ApplicationStatus.REJECTED } }),
      this.prisma.department.findMany({
        include: {
          students: {
            include: {
              applications: true,
            },
          },
        },
      }),
      this.prisma.event.findMany({
        take: 6,
        include: {
          _count: {
            select: { applications: true },
          },
        },
      }),
    ]);

    // Format department stats
    const departmentStats = departments.map((dept) => {
      const appCount = dept.students.reduce((acc, s) => acc + s.applications.length, 0);
      const approvedCount = dept.students.reduce(
        (acc, s) => acc + s.applications.filter((a) => a.status === ApplicationStatus.APPROVED).length,
        0,
      );
      return {
        id: dept.id,
        code: dept.code,
        name: dept.name,
        totalApplications: appCount,
        approvedApplications: approvedCount,
      };
    });

    // Format event stats
    const eventStats = events.map((ev) => ({
      id: ev.id,
      title: ev.title.length > 25 ? ev.title.substring(0, 25) + '...' : ev.title,
      fullTitle: ev.title,
      applicationCount: ev._count.applications,
    }));

    // Monthly trends (last 6 months or synthetic distribution based on existing apps)
    const allApps = await this.prisma.oDApplication.findMany({
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = new Map<string, { month: string; total: number; approved: number; pending: number }>();

    // Pre-populate with previous 5 months up to current
    const currentMonthIdx = new Date().getMonth();
    for (let i = 4; i >= 0; i--) {
      const mIdx = (currentMonthIdx - i + 12) % 12;
      const mName = monthNames[mIdx];
      monthlyMap.set(mName, { month: mName, total: 0, approved: 0, pending: 0 });
    }

    allApps.forEach((app) => {
      const mName = monthNames[new Date(app.createdAt).getMonth()];
      if (!monthlyMap.has(mName)) {
        monthlyMap.set(mName, { month: mName, total: 0, approved: 0, pending: 0 });
      }
      const cur = monthlyMap.get(mName)!;
      cur.total += 1;
      if (app.status === ApplicationStatus.APPROVED) cur.approved += 1;
      if (app.status === ApplicationStatus.PENDING_FACULTY || app.status === ApplicationStatus.PENDING_ADMIN) {
        cur.pending += 1;
      }
    });

    return {
      metrics: {
        totalStudents,
        totalFaculty,
        totalApplications,
        pendingFaculty,
        pendingAdmin,
        approved,
        rejected,
      },
      departmentStats,
      eventStats,
      monthlyTrends: Array.from(monthlyMap.values()),
    };
  }

  async getFacultyOverview(facultyUserId: string) {
    const faculty = await this.prisma.facultyProfile.findUnique({
      where: { userId: facultyUserId },
      include: { department: true },
    });

    if (!faculty) {
      return {
        pendingReviewCount: 0,
        forwardedToAdminCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        recentApplications: [],
      };
    }

    const deptId = faculty.departmentId;

    const [pendingReviewCount, forwardedToAdminCount, approvedCount, rejectedCount, recentApplications] =
      await Promise.all([
        this.prisma.oDApplication.count({
          where: {
            status: ApplicationStatus.PENDING_FACULTY,
            studentProfile: { departmentId: deptId },
          },
        }),
        this.prisma.oDApplication.count({
          where: {
            status: ApplicationStatus.PENDING_ADMIN,
            studentProfile: { departmentId: deptId },
          },
        }),
        this.prisma.oDApplication.count({
          where: {
            status: ApplicationStatus.APPROVED,
            studentProfile: { departmentId: deptId },
          },
        }),
        this.prisma.oDApplication.count({
          where: {
            status: ApplicationStatus.REJECTED,
            studentProfile: { departmentId: deptId },
          },
        }),
        this.prisma.oDApplication.findMany({
          where: {
            studentProfile: { departmentId: deptId },
          },
          take: 6,
          orderBy: { createdAt: 'desc' },
          include: {
            event: true,
            studentProfile: {
              include: { user: true, department: true },
            },
            dates: { include: { periods: true } },
          },
        }),
      ]);

    return {
      department: faculty.department,
      pendingReviewCount,
      forwardedToAdminCount,
      approvedCount,
      rejectedCount,
      recentApplications,
    };
  }

  async getStudentOverview(studentProfileId: string) {
    const [totalApplications, pendingCount, approvedCount, rejectedCount, recentApplications, approvedApps] =
      await Promise.all([
        this.prisma.oDApplication.count({ where: { studentProfileId } }),
        this.prisma.oDApplication.count({
          where: {
            studentProfileId,
            status: { in: [ApplicationStatus.PENDING_FACULTY, ApplicationStatus.PENDING_ADMIN] },
          },
        }),
        this.prisma.oDApplication.count({
          where: { studentProfileId, status: ApplicationStatus.APPROVED },
        }),
        this.prisma.oDApplication.count({
          where: { studentProfileId, status: ApplicationStatus.REJECTED },
        }),
        this.prisma.oDApplication.findMany({
          where: { studentProfileId },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            event: true,
            dates: { include: { periods: true } },
            reviews: { include: { reviewer: true } },
          },
        }),
        this.prisma.oDApplication.findMany({
          where: {
            studentProfileId,
            status: ApplicationStatus.APPROVED,
          },
          include: {
            event: true,
            dates: {
              include: { periods: true },
              orderBy: { date: 'asc' },
            },
          },
        }),
      ]);

    // Extract upcoming approved dates
    const now = new Date();
    const upcomingApprovedDates: any[] = [];

    approvedApps.forEach((app) => {
      app.dates.forEach((d) => {
        if (new Date(d.date) >= now) {
          upcomingApprovedDates.push({
            applicationId: app.id,
            applicationNumber: app.applicationNumber,
            eventTitle: app.event?.title || app.customEventTitle || 'Approved OD',
            date: d.date,
            isFullDay: d.isFullDay,
            periods: d.periods.map((p) => p.periodNumber),
          });
        }
      });
    });

    upcomingApprovedDates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      metrics: {
        totalApplications,
        pendingCount,
        approvedCount,
        rejectedCount,
      },
      upcomingApprovedDates: upcomingApprovedDates.slice(0, 5),
      recentApplications,
    };
  }

  async exportApplicationsCsv(): Promise<string> {
    const applications = await this.prisma.oDApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        event: true,
        studentProfile: {
          include: { user: true, department: true },
        },
        dates: {
          include: { periods: true },
        },
        reviews: {
          include: { reviewer: true },
        },
      },
    });

    const headers = [
      'Application Number',
      'Student Name',
      'Register Number',
      'Department',
      'Year & Section',
      'Reason',
      'Event Title',
      'Status',
      'Dates & Periods',
      'Verification Code',
      'Submitted At',
      'Reviewed By',
    ];

    const rows = applications.map((app) => {
      const datesFormatted = app.dates
        .map((d) => {
          const dt = new Date(d.date).toISOString().split('T')[0];
          const prs = d.isFullDay ? 'Full Day' : `Periods: ${d.periods.map((p) => p.periodNumber).join(',')}`;
          return `${dt} (${prs})`;
        })
        .join('; ');

      const reviewerRemarks = app.reviews
        .map((r) => `${r.role}: ${r.decision} - "${r.remarks || 'No remarks'}"`)
        .join(' | ');

      return [
        app.applicationNumber,
        app.studentProfile.user.fullName,
        app.studentProfile.registerNumber,
        app.studentProfile.department.code,
        `Year ${app.studentProfile.year} - ${app.studentProfile.section}`,
        app.reason,
        app.event?.title || app.customEventTitle || 'N/A',
        app.status,
        datesFormatted,
        app.verificationCode,
        new Date(app.createdAt).toISOString(),
        reviewerRemarks,
      ];
    });

    // Format as CSV lines
    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
    const csvLines = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map((cell) => escapeCsv(String(cell))).join(',')),
    ];

    return csvLines.join('\r\n');
  }
}
