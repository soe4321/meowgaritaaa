import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested, IsBoolean, IsNumber, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ODReason } from '@prisma/client';

export class ODDateDto {
  @ApiProperty({ example: '2026-09-24' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFullDay?: boolean;

  @ApiProperty({ example: [1, 2, 3], type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  periods?: number[];
}

export class CreateODApplicationDto {
  @ApiProperty({ enum: ODReason, example: ODReason.EVENT })
  @IsNotEmpty()
  @IsEnum(ODReason)
  reason: ODReason;

  @ApiProperty({ required: false, example: 'event-uuid-or-empty' })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiProperty({ required: false, example: 'Custom Hackathon 2026' })
  @IsOptional()
  @IsString()
  customEventTitle?: string;

  @ApiProperty({ required: false, example: 'Tech Innovation Hub, Block B' })
  @IsOptional()
  @IsString()
  customVenue?: string;

  @ApiProperty({ required: false, example: 'IEEE Student Branch' })
  @IsOptional()
  @IsString()
  customOrganizer?: string;

  @ApiProperty({ type: [ODDateDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ODDateDto)
  dates: ODDateDto[];

  @ApiProperty({ required: false, type: [String], example: ['doc-uuid-1'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentIds?: string[];

  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  declarationAccepted: boolean;
}
