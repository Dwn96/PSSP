import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReadinessService } from '../services/readiness.service';
import { LearnerProgressDto } from '../dto/learner-progress.dto';
import { ReadinessScoreResponseDto } from '../dto/readiness-score-response.dto';

@ApiTags('readiness')
@Controller('api/readiness')
export class ReadinessController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Post('calculate')
  @ApiOperation({
    summary: 'Calculate readiness score',
    description:
      'Accepts learner progress data and returns an overall readiness score with personalized recommendations',
  })
  @ApiResponse({
    status: 201,
    description: 'Readiness score calculated successfully',
    type: ReadinessScoreResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  calculateScore(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    progress: LearnerProgressDto,
  ): ReadinessScoreResponseDto {
    return this.readinessService.calculateReadinessScore(progress);
  }
}
