import { Injectable, NotFoundException } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

type CronInfo = {
  name: string;
  type: 'cron';
  running: boolean;
  lastDate?: string | null;
  nextDate?: string | null;
  expression?: string | null;
};

@Injectable()
export class TaskAdminService {
  constructor(private readonly registry: SchedulerRegistry) {}

  listAll(): CronInfo[] {
    const items: CronInfo[] = [];
    this.registry.getCronJobs().forEach((job, name) => {
      let nextDate: string | null = null;
      let lastDate: string | null = null;
      let expression: string | null = null;

      try {
        nextDate = job.nextDate().toISO();
      } catch {
        /* empty */
      }

      try {
        lastDate = job.lastDate()?.toISOString() ?? null;
      } catch {
        /* empty */
      }

      try {
        expression = (job.cronTime.source as string) ?? job.cronTime.toString() ?? null;
      } catch {
        /* empty */
      }

      items.push({
        name,
        type: 'cron',
        running: job.isCallbackRunning ?? false,
        lastDate,
        nextDate,
        expression,
      });
    });

    return items;
  }

  async triggerNow(cronName: string) {
    const job = this.registry.getCronJob(cronName);
    if (!job) throw new NotFoundException(`Cron job with name ${cronName} not found`);
    await job.fireOnTick();
    return { ok: true };
  }
}
