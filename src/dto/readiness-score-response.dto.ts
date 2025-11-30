import { ApiProperty } from '@nestjs/swagger';

export enum ReadinessLevel {
  BEGINNER = 'Beginner',
  BUILDING = 'Building',
  READY = 'Ready',
}

export class ReadinessScoreResponseDto {
  @ApiProperty({
    description: 'Overall readiness score (0-100)',
    example: 72,
  })
  score: number;

  @ApiProperty({
    description: 'Readiness level category',
    enum: ReadinessLevel,
    example: ReadinessLevel.BUILDING,
  })
  level: ReadinessLevel;

  @ApiProperty({
    description: 'Personalized recommendation based on progress',
    example:
      'You are strong in academics. Your next focus could be career skills.',
  })
  recommendation: string;

  @ApiProperty({
    description: 'Breakdown of scores by category',
    example: {
      academics: { score: 80, weight: 0.25, weighted_score: 20 },
      career_skills: { score: 60, weight: 0.2, weighted_score: 12 },
      life_skills: { score: 70, weight: 0.15, weighted_score: 10.5 },
      technical_skills: { score: 75, weight: 0.15, weighted_score: 11.25 },
      communication: { score: 65, weight: 0.1, weighted_score: 6.5 },
      teamwork: { score: 85, weight: 0.1, weighted_score: 8.5 },
      critical_thinking: { score: 70, weight: 0.05, weighted_score: 3.5 },
    },
  })
  breakdown: {
    academics: CategoryBreakdown;
    career_skills: CategoryBreakdown;
    life_skills: CategoryBreakdown;
    technical_skills: CategoryBreakdown;
    communication: CategoryBreakdown;
    teamwork: CategoryBreakdown;
    critical_thinking: CategoryBreakdown;
  };
}

export interface CategoryBreakdown {
  score: number;
  weight: number;
  weighted_score: number;
}
