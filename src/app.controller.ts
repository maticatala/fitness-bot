import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SchedulerService } from './scheduler/scheduler.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private schedulerService: SchedulerService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-message')
  async testMessage() {
    return this.schedulerService.sendDailySummary();
  }
}
