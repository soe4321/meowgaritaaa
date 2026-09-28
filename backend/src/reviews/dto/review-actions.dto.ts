import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ReviewDecision } from '@prisma/client';

export class FacultyReviewDto {
  @ApiProperty({
    enum: [ReviewDecision.FORWARDED_TO_ADMIN, ReviewDecision.REJECTED, ReviewDecision.RETURNED_FOR_CORRECTION],
    example: ReviewDecision.FORWARDED_TO_ADMIN,
  })
  @IsNotEmpty()
  @IsEnum(ReviewDecision)
  decision: ReviewDecision;

  @ApiProperty({
    description: 'Reviewer comments and justification (mandatory for rejection or correction)',
    example: 'Recommended for inter-collegiate participation.',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class AdminReviewDto {
  @ApiProperty({
    enum: [ReviewDecision.APPROVED, ReviewDecision.REJECTED],
    example: ReviewDecision.APPROVED,
  })
  @IsNotEmpty()
  @IsEnum(ReviewDecision)
  decision: ReviewDecision;

  @ApiProperty({
    description: 'Administrative remarks or approval endorsement',
    example: 'Final institutional clearance granted.',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
