import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FacultyReviewDto, AdminReviewDto } from './dto/review-actions.dto';
import { ApplicationStatus, ReviewDecision, UserRole } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async facultyReview(applicationId: string, facultyUserId: string, dto: FacultyReviewDto) {
    const application = await this.prisma.oDApplication.findUnique({
      where: { id: applicationId },
      include: {
        studentProfile: { include: { user: true } },
      },
    });

    if (!application) {
      throw new NotFoundException(`OD Application ${applicationId} not found`);
    }

    if (
      application.status !== ApplicationStatus.PENDING_FACULTY &&
      application.status !== ApplicationStatus.SUBMITTED
    ) {
      throw new BadRequestException(
        `Application is in status ${application.status} and cannot undergo faculty review`,
      );
    }

    // Require remarks for rejection or correction
    if (
      (dto.decision === ReviewDecision.REJECTED || dto.decision === ReviewDecision.RETURNED_FOR_CORRECTION) &&
      (!dto.remarks || dto.remarks.trim().length === 0)
    ) {
      throw new BadRequestException('Mandatory remarks are required when rejecting or returning an application');
    }

    let nextStatus: ApplicationStatus;
    if (dto.decision === ReviewDecision.FORWARDED_TO_ADMIN) {
      nextStatus = ApplicationStatus.PENDING_ADMIN;
    } else if (dto.decision === ReviewDecision.REJECTED) {
      nextStatus = ApplicationStatus.REJECTED;
    } else {
      nextStatus = ApplicationStatus.RETURNED_FOR_CORRECTION;
    }

    // 1. Create audit review record
    const review = await this.prisma.approvalReview.create({
      data: {
        applicationId,
        reviewerId: facultyUserId,
        role: UserRole.FACULTY,
        decision: dto.decision,
        remarks: dto.remarks?.trim() || 'Reviewed and forwarded by faculty',
      },
      include: { reviewer: true },
    });

    // 2. Update application status
    const updatedApplication = await this.prisma.oDApplication.update({
      where: { id: applicationId },
      data: { status: nextStatus },
      include: {
        event: true,
        studentProfile: { include: { user: true, department: true } },
        dates: { include: { periods: true } },
        reviews: { include: { reviewer: true } },
        documents: true,
      },
    });

    // 3. Notify student
    const studentUserId = application.studentProfile.userId;
    let notifTitle = '';
    let notifMessage = '';

    if (nextStatus === ApplicationStatus.PENDING_ADMIN) {
      notifTitle = 'Faculty Review Completed';
      notifMessage = `Your OD application ${application.applicationNumber} was approved by department faculty and forwarded to Administration for final clearance.`;
    } else if (nextStatus === ApplicationStatus.RETURNED_FOR_CORRECTION) {
      notifTitle = 'Application Returned for Correction';
      notifMessage = `Faculty returned your OD application ${application.applicationNumber}: "${dto.remarks}".`;
    } else {
      notifTitle = 'Application Rejected by Faculty';
      notifMessage = `Your OD application ${application.applicationNumber} was not approved: "${dto.remarks}".`;
    }

    await this.prisma.notification.create({
      data: {
        userId: studentUserId,
        title: notifTitle,
        message: notifMessage,
        type: nextStatus,
        link: `/applications/${application.id}`,
      },
    });

    // 4. If forwarded to admin, notify administrators
    if (nextStatus === ApplicationStatus.PENDING_ADMIN) {
      const admins = await this.prisma.user.findMany({
        where: { role: UserRole.ADMIN },
      });
      for (const admin of admins) {
        await this.prisma.notification.create({
          data: {
            userId: admin.id,
            title: 'Application Awaiting Final Approval',
            message: `OD application ${application.applicationNumber} (${application.studentProfile.user.fullName}) is awaiting final admin approval.`,
            type: 'PENDING_ADMIN',
            link: `/admin/review/${application.id}`,
          },
        });
      }
    }

    return { application: updatedApplication, review };
  }

  async adminReview(applicationId: string, adminUserId: string, dto: AdminReviewDto) {
    const application = await this.prisma.oDApplication.findUnique({
      where: { id: applicationId },
      include: {
        studentProfile: { include: { user: true } },
      },
    });

    if (!application) {
      throw new NotFoundException(`OD Application ${applicationId} not found`);
    }

    if (application.status !== ApplicationStatus.PENDING_ADMIN) {
      throw new BadRequestException(
        `Application is in status ${application.status}. Only applications pending admin review can be finalized.`,
      );
    }

    if (dto.decision === ReviewDecision.REJECTED && (!dto.remarks || dto.remarks.trim().length === 0)) {
      throw new BadRequestException('Mandatory justification remarks are required when rejecting an application');
    }

    const nextStatus = dto.decision === ReviewDecision.APPROVED ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED;

    // 1. Record Admin Review in audit trail
    const review = await this.prisma.approvalReview.create({
      data: {
        applicationId,
        reviewerId: adminUserId,
        role: UserRole.ADMIN,
        decision: dto.decision,
        remarks: dto.remarks?.trim() || (nextStatus === ApplicationStatus.APPROVED ? 'Final approval granted by Administration' : 'Application rejected by Administration'),
      },
      include: { reviewer: true },
    });

    // 2. Update application status
    const updatedApplication = await this.prisma.oDApplication.update({
      where: { id: applicationId },
      data: { status: nextStatus },
      include: {
        event: true,
        studentProfile: { include: { user: true, department: true } },
        dates: { include: { periods: true } },
        reviews: { include: { reviewer: true } },
        documents: true,
      },
    });

    // 3. Notify student of final decision
    const studentUserId = application.studentProfile.userId;
    const isApproved = nextStatus === ApplicationStatus.APPROVED;

    await this.prisma.notification.create({
      data: {
        userId: studentUserId,
        title: isApproved ? 'OD Application APPROVED!' : 'OD Application Rejected by Admin',
        message: isApproved
          ? `Congratulations! Your OD application ${application.applicationNumber} has been granted final approval. You can now download your official verified OD letter.`
          : `Your OD application ${application.applicationNumber} was rejected by Administration. Remarks: "${dto.remarks}".`,
        type: isApproved ? 'ADMIN_APPROVED' : 'REJECTED',
        link: `/applications/${application.id}`,
      },
    });

    return { application: updatedApplication, review };
  }

  async getAuditTrail(applicationId: string) {
    return this.prisma.approvalReview.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'asc' },
      include: {
        reviewer: {
          include: { facultyProfile: true },
        },
      },
    });
  }
}
