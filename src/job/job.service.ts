import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobService {
  create(createJobDto: CreateJobDto) {
    return {
      id: randomUUID(),
      ...createJobDto,
      createdAt: new Date().toISOString(),
    };
  }
}
