import { Test, TestingModule } from '@nestjs/testing';
import { ReadinessController } from './readiness.controller';
import { ReadinessService } from '../services/readiness.service';
import { LearnerProgressDto } from '../dto/learner-progress.dto';
import { ReadinessLevel } from '../dto/readiness-score-response.dto';

describe('ReadinessController', () => {
  let controller: ReadinessController;
  let service: ReadinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadinessController],
      providers: [ReadinessService],
    }).compile();

    controller = module.get<ReadinessController>(ReadinessController);
    service = module.get<ReadinessService>(ReadinessService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('calculateScore', () => {
    it('should call service and return readiness score', () => {
      const input: LearnerProgressDto = {
        academics: 80,
        career_skills: 60,
        life_skills: 70,
        technical_skills: 75,
        communication: 65,
        teamwork: 85,
        critical_thinking: 70,
      };

      const expectedResult = {
        score: 72,
        level: ReadinessLevel.BUILDING,
        recommendation: 'Test recommendation',
        breakdown: {
          academics: { score: 80, weight: 0.25, weighted_score: 20 },
          career_skills: { score: 60, weight: 0.2, weighted_score: 12 },
          life_skills: { score: 70, weight: 0.15, weighted_score: 10.5 },
          technical_skills: { score: 75, weight: 0.15, weighted_score: 11.25 },
          communication: { score: 65, weight: 0.1, weighted_score: 6.5 },
          teamwork: { score: 85, weight: 0.1, weighted_score: 8.5 },
          critical_thinking: { score: 70, weight: 0.05, weighted_score: 3.5 },
        },
      };

      jest
        .spyOn(service, 'calculateReadinessScore')
        .mockReturnValue(expectedResult);

      const result = controller.calculateScore(input);

      expect(service.calculateReadinessScore).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedResult);
    });

    it('should handle minimum valid scores (0)', () => {
      const input: LearnerProgressDto = {
        academics: 0,
        career_skills: 0,
        life_skills: 0,
        technical_skills: 0,
        communication: 0,
        teamwork: 0,
        critical_thinking: 0,
      };

      const result = controller.calculateScore(input);

      expect(result.score).toBe(0);
      expect(result.level).toBe(ReadinessLevel.BEGINNER);
      expect(result.breakdown.academics.score).toBe(0);
    });

    it('should handle maximum valid scores (100)', () => {
      const input: LearnerProgressDto = {
        academics: 100,
        career_skills: 100,
        life_skills: 100,
        technical_skills: 100,
        communication: 100,
        teamwork: 100,
        critical_thinking: 100,
      };

      const result = controller.calculateScore(input);

      expect(result.score).toBe(100);
      expect(result.level).toBe(ReadinessLevel.READY);
      expect(result.breakdown.academics.score).toBe(100);
    });

    it('should return detailed breakdown for all 7 categories', () => {
      const input: LearnerProgressDto = {
        academics: 75,
        career_skills: 65,
        life_skills: 55,
        technical_skills: 70,
        communication: 60,
        teamwork: 80,
        critical_thinking: 65,
      };

      const result = controller.calculateScore(input);

      expect(result.breakdown).toHaveProperty('academics');
      expect(result.breakdown).toHaveProperty('career_skills');
      expect(result.breakdown).toHaveProperty('life_skills');
      expect(result.breakdown).toHaveProperty('technical_skills');
      expect(result.breakdown).toHaveProperty('communication');
      expect(result.breakdown).toHaveProperty('teamwork');
      expect(result.breakdown).toHaveProperty('critical_thinking');
      expect(result.breakdown.academics).toHaveProperty('score');
      expect(result.breakdown.academics).toHaveProperty('weight');
      expect(result.breakdown.academics).toHaveProperty('weighted_score');
    });

    it('should return a recommendation string', () => {
      const input: LearnerProgressDto = {
        academics: 80,
        career_skills: 60,
        life_skills: 70,
        technical_skills: 75,
        communication: 65,
        teamwork: 85,
        critical_thinking: 70,
      };

      const result = controller.calculateScore(input);

      expect(typeof result.recommendation).toBe('string');
      expect(result.recommendation.length).toBeGreaterThan(0);
    });
  });
});
