import { Module } from '@nestjs/common';
import { AuthorityService } from './authority.service';
import { AuthorityController } from './authority.controller';

@Module({
  providers: [AuthorityService],
  controllers: [AuthorityController],
})

export class AuthorityModule {
}
