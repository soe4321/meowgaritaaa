import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class StudentLoginDto {
  @ApiProperty({
    description: 'Student Register Number (e.g. 2026CS101) or College Email',
    example: 'student1@campus.edu',
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'Student Password',
    example: 'Student@123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
