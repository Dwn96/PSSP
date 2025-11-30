import { Injectable } from '@nestjs/common';
import { LearnerProgressDto } from '../dto/learner-progress.dto';
import {
  ReadinessScoreResponseDto,
  ReadinessLevel,
  CategoryBreakdown,
} from '../dto/readiness-score-response.dto';

/**
 * Service responsible for calculating readiness scores and generating recommendations
 */
@Injectable()
export class ReadinessService {
  // Weights for each category (must sum to 1.0)
  private readonly WEIGHTS = {
    academics: 0.25, // 25% - Foundation for learning
    career_skills: 0.2, // 20% - Professional readiness
    life_skills: 0.15, // 15% - Personal development
    technical_skills: 0.15, // 15% - Digital literacy
    communication: 0.1, // 10% - Presentation and articulation
    teamwork: 0.1, // 10% - Collaboration
    critical_thinking: 0.05, // 5% - Problem-solving
  };

  // Thresholds for readiness levels
  private readonly THRESHOLDS = {
    READY: 75, // 75+ = Ready
    BUILDING: 50, // 50-74 = Building
    // Below 50 = Beginner
  };

  // Threshold for identifying strong areas
  private readonly STRONG_THRESHOLD = 75;
  // Threshold for identifying weak areas
  private readonly WEAK_THRESHOLD = 60;

  /**
   * Calculate the overall readiness score based on learner progress
   * @param progress - Learner's progress across different categories
   * @returns Readiness score with recommendations
   */
  calculateReadinessScore(
    progress: LearnerProgressDto,
  ): ReadinessScoreResponseDto {
    const categories = Object.keys(this.WEIGHTS);
    const breakdown: any = {};
    let totalScore = 0;

    for (const key of categories) {
      const result = this.calculateCategoryBreakdown(
        progress[key],
        this.WEIGHTS[key],
      );

      breakdown[key] = result;
      totalScore += result.weighted_score;
    }

    const score = Math.round(totalScore);
    const level = this.determineReadinessLevel(score);
    const recommendation = this.generateRecommendation(progress, score, level);

    return {
      score,
      level,
      recommendation,
      breakdown,
    };
  }

  /**
   * Calculate breakdown for a single category
   */
  private calculateCategoryBreakdown(
    score: number,
    weight: number,
  ): CategoryBreakdown {
    return {
      score,
      weight,
      weighted_score: score * weight,
    };
  }

  /**
   * Determine readiness level based on overall score
   */
  private determineReadinessLevel(score: number): ReadinessLevel {
    if (score >= this.THRESHOLDS.READY) {
      return ReadinessLevel.READY;
    } else if (score >= this.THRESHOLDS.BUILDING) {
      return ReadinessLevel.BUILDING;
    } else {
      return ReadinessLevel.BEGINNER;
    }
  }

  /**
   * Generate personalized recommendation based on progress
   */
  private generateRecommendation(
    progress: LearnerProgressDto,
    score: number,
    level: ReadinessLevel,
  ): string {
    const categories = [
      { name: 'academics', score: progress.academics, label: 'academics' },
      {
        name: 'career_skills',
        score: progress.career_skills,
        label: 'career skills',
      },
      {
        name: 'life_skills',
        score: progress.life_skills,
        label: 'life skills',
      },
      {
        name: 'technical_skills',
        score: progress.technical_skills,
        label: 'technical skills',
      },
      {
        name: 'communication',
        score: progress.communication,
        label: 'communication',
      },
      { name: 'teamwork', score: progress.teamwork, label: 'teamwork' },
      {
        name: 'critical_thinking',
        score: progress.critical_thinking,
        label: 'critical thinking',
      },
    ];

    // Find strongest and weakest areas
    const strongest = categories.reduce((prev, current) =>
      current.score > prev.score ? current : prev,
    );
    const weakest = categories.reduce((prev, current) =>
      current.score < prev.score ? current : prev,
    );

    // Get top 2 weakest areas for more specific recommendations
    const sortedByScore = [...categories].sort((a, b) => a.score - b.score);
    const weakestTwo = sortedByScore.slice(0, 2);

    // Generate recommendation based on level and scores
    if (level === ReadinessLevel.READY) {
      return this.generateReadyRecommendation(categories, weakest);
    } else if (level === ReadinessLevel.BUILDING) {
      return this.generateBuildingRecommendation(
        categories,
        strongest,
        weakest,
        weakestTwo,
      );
    } else {
      return this.generateBeginnerRecommendation(categories, weakestTwo);
    }
  }

  /**
   * Recommendation for learners at "Ready" level
   */
  private generateReadyRecommendation(categories: any[], weakest: any): string {
    const allStrong = categories.every(
      (cat) => cat.score >= this.STRONG_THRESHOLD,
    );

    if (allStrong) {
      return 'Excellent work! You are ready across all areas. Consider taking on advanced challenges or mentoring others.';
    } else {
      return `You are ready overall! To reach excellence, consider strengthening your ${weakest.label} (currently at ${weakest.score}).`;
    }
  }

  /**
   * Recommendation for learners at "Building" level
   */
  private generateBuildingRecommendation(
    categories: any[],
    strongest: any,
    weakest: any,
    weakestTwo: any[],
  ): string {
    if (strongest.score >= this.STRONG_THRESHOLD) {
      // If there are multiple weak areas, mention top 2
      const weakAreas = categories.filter(
        (cat) => cat.score < this.WEAK_THRESHOLD,
      );
      if (weakAreas.length >= 2) {
        return `You are strong in ${strongest.label}. Focus on ${weakestTwo[0].label} and ${weakestTwo[1].label} to build a more balanced foundation.`;
      }
      return `You are strong in ${strongest.label}. Your next focus could be ${weakest.label} to build a more balanced foundation.`;
    } else {
      return `You are building across several areas. Keep engaging with ${weakest.label} modules to strengthen your foundation.`;
    }
  }

  /**
   * Recommendation for learners at "Beginner" level
   */
  private generateBeginnerRecommendation(
    categories: any[],
    weakestTwo: any[],
  ): string {
    const lowestAreas = categories
      .filter((cat) => cat.score < this.WEAK_THRESHOLD)
      .map((cat) => cat.label);

    if (lowestAreas.length >= 2) {
      return `You're just getting started! Focus on building foundational skills in ${weakestTwo[0].label} and ${weakestTwo[1].label} to accelerate your progress.`;
    } else {
      return `You're on your learning journey! Consistent engagement across all areas will help you build momentum.`;
    }
  }
}
