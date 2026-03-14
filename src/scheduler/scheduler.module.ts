import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { FitnessModule } from 'src/fitness/fitness.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

@Module({
  imports: [FitnessModule, WhatsappModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
