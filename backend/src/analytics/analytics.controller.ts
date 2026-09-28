import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Analytics & Reports')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('admin-overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get institutional OD metrics and charts data (Admin)' })
  async getAdminOverview() {
    return this.analyticsService.getAdminOverview();
  }

  @Get('faculty-overview')
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get faculty department review metrics' })
  async getFacultyOverview(@Request() req) {
    return this.analyticsService.getFacultyOverview(req.user.id);
  }

  @Get('student-overview')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get student personalized OD summary' })
  async getStudentOverview(@Request() req) {
    return this.analyticsService.getStudentOverview(req.user.studentProfile?.id);
  }

  @Get('export-csv')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Download complete OD applications report as CSV' })
  async exportCsv(@Res() res: Response) {
    const csvContent = await this.analyticsService.exportApplicationsCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="campus_od_institutional_report.csv"');
    res.send(csvContent);
  }
}
