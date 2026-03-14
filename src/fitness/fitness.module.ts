import { Module } from '@nestjs/common';
import { FitnessService } from './fitness.service';

@Module({
  providers: [FitnessService],
  exports: [FitnessService],
})
export class FitnessModule {}
