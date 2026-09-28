import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ODApplicationsService } from './od-applications.service';
import { CreateODApplicationDto } from './dto/create-od-application.dto';
import { FilterODApplicationsDto } from './dto/filter-od-applications.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('OD Applications')
@Controller('od-applications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ODApplicationsController {
  constructor(private applicationsService: ODApplicationsService) {}

  @Post()
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Submit new OD application (Student)' })
  async create(@Request() req, @Body() dto: CreateODApplicationDto) {
    const studentProfileId = req.user.studentProfile?.id;
    if (!studentProfileId) {
      throw new ForbiddenException('Only registered students with active profiles can submit OD applications');
    }
    return this.applicationsService.create(studentProfileId, dto);
  }

  @Get('my')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'List current student OD applications' })
  async getMyApplications(@Request() req) {
    const studentProfileId = req.user.studentProfile?.id;
    if (!studentProfileId) {
      throw new ForbiddenException('Student profile not found');
    }
    return this.applicationsService.getMyApplications(studentProfileId);
  }

  @Get()
  @Roles(UserRole.FACULTY, UserRole.ADMIN)
  @ApiOperation({ summary: 'Search and filter all OD applications (Faculty & Admin)' })
  async findAll(@Request() req, @Query() query: FilterODApplicationsDto) {
    // If faculty, filter by faculty department
    const facultyDeptId = req.user.role === UserRole.FACULTY ? req.user.facultyProfile?.departmentId : undefined;
    return this.applicationsService.findAll(query, facultyDeptId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed application view including dates, periods, and audit trail' })
  async findOne(@Request() req, @Param('id') id: string) {
    const app = await this.applicationsService.findOne(id);
    // Role protection: Students may only view their own applications
    if (req.user.role === UserRole.STUDENT && app.studentProfile.userId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to view this application');
    }
    return app;
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel an OD application before final review' })
  async cancel(@Request() req, @Param('id') id: string) {
    return this.applicationsService.cancelApplication(id, req.user.id, req.user.role);
  }
}
