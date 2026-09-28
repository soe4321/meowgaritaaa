import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Users Directory')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('students')
  @Roles(UserRole.ADMIN, UserRole.FACULTY)
  @ApiOperation({ summary: 'List student directory with department filtering' })
  async getStudents(@Query('departmentId') departmentId?: string) {
    return this.usersService.findAllStudents(departmentId);
  }

  @Get('faculty')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List faculty directory (Admin)' })
  async getFaculty(@Query('departmentId') departmentId?: string) {
    return this.usersService.findAllFaculty(departmentId);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all accounts in the system (Admin)' })
  async getAllUsers() {
    return this.usersService.findAllUsers();
  }
}
