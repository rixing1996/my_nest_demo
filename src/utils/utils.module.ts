import { Global, Module } from '@nestjs/common';
import { UtilService } from './util.service';
import { CryptoService } from './crypto.service';
import { ResponseService } from './response.service';
import { ValidateService } from './validate.service';

@Global()
@Module({
  providers: [UtilService, CryptoService, ResponseService, ValidateService],
  controllers: [],
  exports: [UtilService, CryptoService, ResponseService, ValidateService],
})

export class UtilsModule {
}
