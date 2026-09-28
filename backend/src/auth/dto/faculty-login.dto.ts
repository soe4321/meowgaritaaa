import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class FacultyLoginDto {
  @ApiProperty({
    description: 'Official College Email',
    example: 'faculty.cs@campus.edu',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Faculty / Admin Password',
    example: 'Faculty@123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}
