import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Readiness API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply the same validation pipe as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/readiness/calculate', () => {
    it('should calculate readiness score for valid input with 7 categories', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 80,
          career_skills: 60,
          life_skills: 70,
          technical_skills: 75,
          communication: 65,
          teamwork: 85,
          critical_thinking: 70,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('score');
          expect(res.body).toHaveProperty('level');
          expect(res.body).toHaveProperty('recommendation');
          expect(res.body).toHaveProperty('breakdown');
          expect(res.body.score).toBe(72);
          expect(res.body.level).toBe('Building');
        });
    });

    it('should return Ready level for high scores', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 90,
          career_skills: 85,
          life_skills: 80,
          technical_skills: 85,
          communication: 80,
          teamwork: 90,
          critical_thinking: 85,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.score).toBe(86);
          expect(res.body.level).toBe('Ready');
          expect(res.body.recommendation).toContain('ready');
        });
    });

    it('should return Beginner level for low scores', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 45,
          career_skills: 40,
          life_skills: 35,
          technical_skills: 40,
          communication: 35,
          teamwork: 45,
          critical_thinking: 40,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.score).toBe(41);
          expect(res.body.level).toBe('Beginner');
        });
    });

    it('should include detailed breakdown for all 7 categories', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 75,
          career_skills: 65,
          life_skills: 55,
          technical_skills: 70,
          communication: 60,
          teamwork: 80,
          critical_thinking: 65,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.breakdown.academics).toEqual({
            score: 75,
            weight: 0.25,
            weighted_score: 18.75,
          });
          expect(res.body.breakdown.career_skills).toEqual({
            score: 65,
            weight: 0.2,
            weighted_score: 13,
          });
          expect(res.body.breakdown.life_skills).toEqual({
            score: 55,
            weight: 0.15,
            weighted_score: 8.25,
          });
          expect(res.body.breakdown.technical_skills).toEqual({
            score: 70,
            weight: 0.15,
            weighted_score: 10.5,
          });
          expect(res.body.breakdown.communication).toEqual({
            score: 60,
            weight: 0.1,
            weighted_score: 6,
          });
          expect(res.body.breakdown.teamwork).toEqual({
            score: 80,
            weight: 0.1,
            weighted_score: 8,
          });
          expect(res.body.breakdown.critical_thinking).toEqual({
            score: 65,
            weight: 0.05,
            weighted_score: 3.25,
          });
        });
    });

    it('should reject request with missing fields', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 80,
          career_skills: 60,
          life_skills: 70,
          technical_skills: 75,
          communication: 65,
          teamwork: 85,
          // critical_thinking missing
        })
        .expect(400)
        .expect((res) => {
          expect(Array.isArray(res.body.message)).toBe(true);
          expect(
            res.body.message.some((msg: string) =>
              msg.includes('critical_thinking'),
            ),
          ).toBe(true);
        });
    });

    it('should reject request with scores above 100', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 150,
          career_skills: 60,
          life_skills: 70,
          technical_skills: 75,
          communication: 65,
          teamwork: 85,
          critical_thinking: 70,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([
              expect.stringContaining('academics must not be greater than 100'),
            ]),
          );
        });
    });

    it('should reject request with scores below 0', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 80,
          career_skills: -10,
          life_skills: 70,
          technical_skills: 75,
          communication: 65,
          teamwork: 85,
          critical_thinking: 70,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(
            expect.arrayContaining([
              expect.stringContaining('career_skills must not be less than 0'),
            ]),
          );
        });
    });

    it('should reject request with non-numeric values', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 'eighty',
          career_skills: 60,
          life_skills: 70,
          technical_skills: 75,
          communication: 65,
          teamwork: 85,
          critical_thinking: 70,
        })
        .expect(400);
    });

    it('should reject request with extra fields when forbidNonWhitelisted is true', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 80,
          career_skills: 60,
          life_skills: 70,
          technical_skills: 75,
          communication: 65,
          teamwork: 85,
          critical_thinking: 70,
          extra_field: 'should be rejected',
        })
        .expect(400);
    });

    it('should handle edge case: all zeros', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 0,
          career_skills: 0,
          life_skills: 0,
          technical_skills: 0,
          communication: 0,
          teamwork: 0,
          critical_thinking: 0,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.score).toBe(0);
          expect(res.body.level).toBe('Beginner');
        });
    });

    it('should handle edge case: all 100s', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 100,
          career_skills: 100,
          life_skills: 100,
          technical_skills: 100,
          communication: 100,
          teamwork: 100,
          critical_thinking: 100,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.score).toBe(100);
          expect(res.body.level).toBe('Ready');
        });
    });

    it('should handle boundary: exactly 75 (Ready threshold)', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 75,
          career_skills: 75,
          life_skills: 75,
          technical_skills: 75,
          communication: 75,
          teamwork: 75,
          critical_thinking: 75,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.score).toBe(75);
          expect(res.body.level).toBe('Ready');
        });
    });

    it('should handle boundary: exactly 50 (Building threshold)', () => {
      return request(app.getHttpServer())
        .post('/api/readiness/calculate')
        .send({
          academics: 50,
          career_skills: 50,
          life_skills: 50,
          technical_skills: 50,
          communication: 50,
          teamwork: 50,
          critical_thinking: 50,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.score).toBe(50);
          expect(res.body.level).toBe('Building');
        });
    });
  });
});
