import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'National AI & Cloud Computing Hackathon 2026' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '36-hour inter-collegiate coding marathon.' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'Centre for Intelligent Systems' })
  @IsNotEmpty()
  @IsString()
  organizer: string;

  @ApiProperty({ example: 'Auditorium Main Hall & Computing Labs' })
  @IsNotEmpty()
  @IsString()
  venue: string;

  @ApiProperty({ example: '2026-09-24T09:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-09-26T18:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: '2026-09-23T23:59:59.000Z' })
  @IsNotEmpty()
  @IsDateString()
  deadline: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  requiresDocument?: boolean;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
