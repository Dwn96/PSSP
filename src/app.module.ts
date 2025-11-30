import { Module } from '@nestjs/common';
import { ReadinessController } from './controllers/readiness.controller';
import { ReadinessService } from './services/readiness.service';

@Module({
  imports: [],
  controllers: [ReadinessController],
  providers: [ReadinessService],
})
export class AppModule {}
