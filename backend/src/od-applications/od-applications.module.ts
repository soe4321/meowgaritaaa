import { Module } from '@nestjs/common';
import { ODApplicationsService } from './od-applications.service';
import { ODApplicationsController } from './od-applications.controller';

@Module({
  providers: [ODApplicationsService],
  controllers: [ODApplicationsController],
  exports: [ODApplicationsService],
})
export class ODApplicationsModule {}
