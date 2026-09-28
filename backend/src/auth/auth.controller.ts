import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { StudentLoginDto } from './dto/student-login.dto';
import { FacultyLoginDto } from './dto/faculty-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('student-login')
  @ApiOperation({ summary: 'Student portal login using email or register number' })
  @ApiResponse({ status: 200, description: 'Student authenticated successfully' })
  async studentLogin(@Body() dto: StudentLoginDto) {
    return this.authService.studentLogin(dto);
  }

  @Post('faculty-login')
  @ApiOperation({ summary: 'Faculty and Admin portal login using college email' })
  @ApiResponse({ status: 200, description: 'Faculty or Admin authenticated successfully' })
  async facultyLogin(@Body() dto: FacultyLoginDto) {
    return this.authService.facultyLogin(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get profile of current authenticated user' })
  async getMe(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
