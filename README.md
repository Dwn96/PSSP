# Readiness Score API

A NestJS-based REST API that calculates learner readiness scores based on progress across seven comprehensive skill areas. The API provides personalized recommendations to help learners focus their development efforts.

## Features

- **Weighted Scoring Algorithm**: Calculates overall readiness using configurable weights for each skill category
- **Intelligent Recommendations**: Generates personalized guidance based on learner performance patterns
- **Level Classification**: Categorizes learners as Beginner, Building, or Ready
- **Detailed Breakdown**: Provides transparent scoring breakdown for each category
- **Input Validation**: Robust validation using class-validator
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **CORS Enabled**: Ready for frontend integration

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

### API Documentation

Once running, access the interactive Swagger documentation at:
```
http://localhost:3000/api/docs
```

## API Endpoints

### Calculate Readiness Score

**Endpoint**: `POST /api/readiness/calculate`

**Request Body**:
```json
{
  "academics": 80,
  "career_skills": 60,
  "life_skills": 70,
  "technical_skills": 75,
  "communication": 65,
  "teamwork": 85,
  "critical_thinking": 70
}
```

**Field Validation**:
- All fields are required
- Values must be numbers between 0 and 100 (inclusive)

**Response** (201 Created):
```json
{
  "score": 72,
  "level": "Building",
  "recommendation": "You are strong in teamwork. Focus on career skills and communication to build a more balanced foundation.",
  "breakdown": {
    "academics": {
      "score": 80,
      "weight": 0.25,
      "weighted_score": 20
    },
    "career_skills": {
      "score": 60,
      "weight": 0.2,
      "weighted_score": 12
    },
    "life_skills": {
      "score": 70,
      "weight": 0.15,
      "weighted_score": 10.5
    },
    "technical_skills": {
      "score": 75,
      "weight": 0.15,
      "weighted_score": 11.25
    },
    "communication": {
      "score": 65,
      "weight": 0.1,
      "weighted_score": 6.5
    },
    "teamwork": {
      "score": 85,
      "weight": 0.1,
      "weighted_score": 8.5
    },
    "critical_thinking": {
      "score": 70,
      "weight": 0.05,
      "weighted_score": 3.5
    }
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": [
    "academics must not be greater than 100",
    "career_skills must not be less than 0"
  ],
  "error": "Bad Request"
}
```

## Scoring Logic

### Weighted Average Calculation

The overall readiness score is calculated using a weighted average of the 7 input categories:

| Category | Weight | Description |
|----------|--------|-------------|
| **Academics** | 25% | Foundation for learning and critical thinking |
| **Career Skills** | 20% | Professional readiness and employability |
| **Life Skills** | 15% | Personal development and adaptability |
| **Technical Skills** | 15% | Digital literacy and technical competency |
| **Communication** | 10% | Presentation and articulation abilities |
| **Teamwork** | 10% | Collaboration and interpersonal skills |
| **Critical Thinking** | 5% | Problem-solving and analytical reasoning |

**Formula**:
```
Overall Score =  (academics × 0.25) + (career_skills × 0.2) + (life_skills × 0.15) + 
                (technical_skills × 0.15) + (communication × 0.1) + 
                (teamwork × 0.1) + (critical_thinking × 0.05)
```

The score is rounded to the nearest integer (0-100).

### Readiness Levels

Learners are classified into three levels based on their overall score:

| Level | Score Range | Description |
|-------|-------------|-------------|
| **Ready** | 75-100 | Learner is well-prepared across most areas |
| **Building** | 50-74 | Learner is making progress but needs continued focus |
| **Beginner** | 0-49 | Learner is in early stages and needs foundational work |

### Recommendation Engine

The API generates personalized recommendations using the following logic:

#### For "Ready" Learners (75+)
- If all categories ≥ 75: Encourages advanced challenges or mentoring
- Otherwise: Suggests strengthening the weakest area to reach excellence

#### For "Building" Learners (50-74)
- Highlights strength and recommends focusing on weakest area
- Otherwise: Encourages continued engagement with weakest area

#### For "Beginner" Learners (0-49)
- If 2+ areas < 60: Recommends focusing on foundational skills in those areas
- Otherwise: Encourages consistent engagement across all areas

### Thresholds

- **Strong Area**: Score ≥ 75
- **Weak Area**: Score < 60

## Project Structure

```
src/
├── controllers/
│   └── readiness.controller.ts    # REST endpoint handler
├── services/
│   └── readiness.service.ts       # Scoring and recommendation logic
├── dto/
│   ├── learner-progress.dto.ts    # Input validation schema
│   └── readiness-score-response.dto.ts  # Response structure
├── app.module.ts                  # Application module
└── main.ts                        # Application bootstrap
```

## Testing the API

### Using cURL

```bash
curl -X POST http://localhost:3000/api/readiness/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "academics": 80,
    "career_skills": 60,
    "life_skills": 70,
    "technical_skills": 75,
    "communication": 65,
    "teamwork": 85,
    "critical_thinking": 70
  }'
```

### Example Scenarios

#### Scenario 1: Beginner Learner
```json
{
  "academics": 45,
  "career_skills": 40,
  "life_skills": 35,
  "technical_skills": 38,
  "communication": 42,
  "teamwork": 40,
  "critical_thinking": 35
}
```
Expected: Score ~40, Level: Beginner, Recommendation focuses on foundational skills

#### Scenario 2: Building Learner with Strength
```json
{
  "academics": 85,
  "career_skills": 55,
  "life_skills": 60,
  "technical_skills": 65,
  "communication": 58,
  "teamwork": 70,
  "critical_thinking": 62
}
```
Expected: Score ~67, Level: Building, Recommendation highlights academic strength

#### Scenario 3: Ready Learner
```json
{
  "academics": 90,
  "career_skills": 85,
  "life_skills": 80,
  "technical_skills": 82,
  "communication": 78,
  "teamwork": 88,
  "critical_thinking": 75
}
```
Expected: Score ~84, Level: Ready, Recommendation encourages advanced work

## Design Decisions

- **Weighted Scoring**: Academics (25%) and career skills (20%) have higher weights to reflect their importance for overall readiness
- **Three Levels**: Simple classification (Beginner/Building/Ready) instead of complex granular scoring
- **Stateless**: Each calculation is independent - no data persistence or historical tracking
- **Personalized Recommendations**: Generated based on strengths, weaknesses, and overall performance level

## Production Considerations

### Scalability

- **Stateless Design**: The API is fully stateless, making it easy to horizontally scale
- **Caching**: For repeated calculations with identical inputs, implement Redis caching
- **Rate Limiting**: Add rate limiting to prevent abuse (e.g., using `@nestjs/throttler`)

### Data Persistence

- **Database Integration**: Add PostgreSQL/MongoDB to store:
  - Historical scores for trend analysis
  - Learner profiles and progress tracking
  - Recommendation effectiveness metrics
- **Analytics**: Track which recommendations lead to improved scores

### Enhanced Features

1. **Personalization**:
   - Custom weights based on learner goals or program requirements
   - Age/grade-level appropriate recommendations
   - Multi-language support

2. **Advanced Scoring**:
   - Time-weighted scores (recent performance matters more)
   - Skill dependencies (e.g., certain career skills require academic foundation)
   - Confidence intervals based on data quality

3. **Integration**:
   - Webhook notifications when learners reach new levels
   - LMS integration for automatic data sync
   - Dashboard for educators to monitor cohort progress

4. **Security**:
   - Authentication (JWT, OAuth)
   - Authorization (role-based access)
   - Input sanitization and rate limiting

### Monitoring & Observability

- **Logging**: Implement structured logging (e.g., Winston, Pino)
- **Metrics**: Track API latency, error rates, score distributions
- **Health Checks**: Add `/health` endpoint for load balancers
- **APM**: Integrate Application Performance Monitoring (e.g., New Relic, DataDog)

## Development

### Available Scripts

```bash
# Run in development mode
npm run start:dev

# Build for production
npm run build

# Run in production mode
npm run start:prod

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

### Environment Variables

Create a `.env` file for configuration:

```env
PORT=3000
NODE_ENV=development
```

## Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI (@nestjs/swagger)
- **Runtime**: Node.js 18+

## License

MIT

## Support

For questions or issues, please open an issue in the repository.
