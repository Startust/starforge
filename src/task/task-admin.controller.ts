import { Controller, Get, Param, Post } from '@nestjs/common';

import { TaskAdminService } from './task-admin.service';

@Controller('admin/tasks')
export class TaskAdminController {
  constructor(private readonly adminService: TaskAdminService) {}

  @Get()
  list() {
    return this.adminService.listAll();
  }

  @Post(':name/trigger')
  triggerNow(@Param('name') name: string) {
    return this.adminService.triggerNow(name);
  }
}
