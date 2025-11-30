import { Test, TestingModule } from '@nestjs/testing';
import { ReadinessService } from './readiness.service';
import { ReadinessLevel } from '../dto/readiness-score-response.dto';

describe('ReadinessService', () => {
  let service: ReadinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReadinessService],
    }).compile();

    service = module.get<ReadinessService>(ReadinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateReadinessScore', () => {
    it('should calculate correct weighted score with 7 categories', () => {
      const result = service.calculateReadinessScore({
        academics: 80,
        career_skills: 60,
        life_skills: 70,
        technical_skills: 75,
        communication: 65,
        teamwork: 85,
        critical_thinking: 70,
      });

      // (80*0.25) + (60*0.2) + (70*0.15) + (75*0.15) + (65*0.1) + (85*0.1) + (70*0.05)
      // = 20 + 12 + 10.5 + 11.25 + 6.5 + 8.5 + 3.5 = 72.25 ≈ 72
      expect(result.score).toBe(72);
    });

    it('should classify as Ready for high scores', () => {
      const result = service.calculateReadinessScore({
        academics: 90,
        career_skills: 85,
        life_skills: 80,
        technical_skills: 85,
        communication: 80,
        teamwork: 90,
        critical_thinking: 85,
      });

      expect(result.level).toBe(ReadinessLevel.READY);
      expect(result.score).toBeGreaterThanOrEqual(75);
    });

    it('should classify as Building for medium scores', () => {
      const result = service.calculateReadinessScore({
        academics: 70,
        career_skills: 60,
        life_skills: 65,
        technical_skills: 70,
        communication: 60,
        teamwork: 65,
        critical_thinking: 60,
      });

      expect(result.level).toBe(ReadinessLevel.BUILDING);
      expect(result.score).toBeGreaterThanOrEqual(50);
      expect(result.score).toBeLessThan(75);
    });

    it('should classify as Beginner for low scores', () => {
      const result = service.calculateReadinessScore({
        academics: 40,
        career_skills: 35,
        life_skills: 45,
        technical_skills: 40,
        communication: 35,
        teamwork: 45,
        critical_thinking: 40,
      });

      expect(result.level).toBe(ReadinessLevel.BEGINNER);
      expect(result.score).toBeLessThan(50);
    });

    it('should provide detailed breakdown for all 7 categories', () => {
      const result = service.calculateReadinessScore({
        academics: 80,
        career_skills: 60,
        life_skills: 70,
        technical_skills: 75,
        communication: 65,
        teamwork: 85,
        critical_thinking: 70,
      });

      expect(result.breakdown.academics).toEqual({
        score: 80,
        weight: 0.25,
        weighted_score: 20,
      });
      expect(result.breakdown.career_skills).toEqual({
        score: 60,
        weight: 0.2,
        weighted_score: 12,
      });
      expect(result.breakdown.life_skills).toEqual({
        score: 70,
        weight: 0.15,
        weighted_score: 10.5,
      });
      expect(result.breakdown.technical_skills).toEqual({
        score: 75,
        weight: 0.15,
        weighted_score: 11.25,
      });
      expect(result.breakdown.communication).toEqual({
        score: 65,
        weight: 0.1,
        weighted_score: 6.5,
      });
      expect(result.breakdown.teamwork).toEqual({
        score: 85,
        weight: 0.1,
        weighted_score: 8.5,
      });
      expect(result.breakdown.critical_thinking).toEqual({
        score: 70,
        weight: 0.05,
        weighted_score: 3.5,
      });
    });

    it('should generate appropriate recommendation', () => {
      const result = service.calculateReadinessScore({
        academics: 80,
        career_skills: 60,
        life_skills: 70,
        technical_skills: 75,
        communication: 65,
        teamwork: 85,
        critical_thinking: 70,
      });

      expect(result.recommendation).toBeDefined();
      expect(typeof result.recommendation).toBe('string');
      expect(result.recommendation.length).toBeGreaterThan(0);
    });
  });
});
