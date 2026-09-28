import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { FacultyReviewDto, AdminReviewDto } from './dto/review-actions.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Reviews & Approvals')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post('faculty/:applicationId')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiOperation({ summary: 'Faculty review: Approve & Forward, Reject, or Return for Correction' })
  async facultyReview(
    @Request() req,
    @Param('applicationId') applicationId: string,
    @Body() dto: FacultyReviewDto,
  ) {
    return this.reviewsService.facultyReview(applicationId, req.user.id, dto);
  }

  @Post('admin/:applicationId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin review: Grant Final Approval or Reject with remarks' })
  async adminReview(
    @Request() req,
    @Param('applicationId') applicationId: string,
    @Body() dto: AdminReviewDto,
  ) {
    return this.reviewsService.adminReview(applicationId, req.user.id, dto);
  }

  @Get('audit/:applicationId')
  @ApiOperation({ summary: 'Get complete approval and decision audit history for an application' })
  async getAuditTrail(@Param('applicationId') applicationId: string) {
    return this.reviewsService.getAuditTrail(applicationId);
  }
}
