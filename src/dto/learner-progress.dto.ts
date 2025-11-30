import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LearnerProgressDto {
  @ApiProperty({
    description: 'Academic performance score',
    minimum: 0,
    maximum: 100,
    example: 80,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  academics: number;

  @ApiProperty({
    description: 'Career skills proficiency score',
    minimum: 0,
    maximum: 100,
    example: 60,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  career_skills: number;

  @ApiProperty({
    description: 'Life skills competency score',
    minimum: 0,
    maximum: 100,
    example: 70,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  life_skills: number;

  @ApiProperty({
    description: 'Technical and digital literacy score',
    minimum: 0,
    maximum: 100,
    example: 75,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  technical_skills: number;

  @ApiProperty({
    description: 'Communication and presentation skills score',
    minimum: 0,
    maximum: 100,
    example: 65,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  communication: number;

  @ApiProperty({
    description: 'Teamwork and collaboration score',
    minimum: 0,
    maximum: 100,
    example: 85,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  teamwork: number;

  @ApiProperty({
    description: 'Critical thinking and problem-solving score',
    minimum: 0,
    maximum: 100,
    example: 70,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  critical_thinking: number;
}
