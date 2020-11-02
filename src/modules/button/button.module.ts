import { Module } from '@nestjs/common';
import { ButtonService } from './button.service';
import { ButtonController } from './button.controller';

@Module({
  providers: [ButtonService],
  controllers: [ButtonController],
})

export class ButtonModule {
}
