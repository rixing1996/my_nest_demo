import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ButtonService } from './button.service';
import { AuthGuard } from '@nestjs/passport';
import { TokenGuard } from '../../guard/token.guard';
import { ValidateService } from '../../utils/validate.service';
import { TokenId } from '../../decorator/tokenId.decorator';
import { ButtonTypeDto } from './dto/buttonType.dto';
import { ButtonDto } from './dto/button.dto';

@Controller('api/button')
@ApiTags('按钮部分')
export class ButtonController {
  constructor(
    private readonly buttonService: ButtonService,
    private readonly validateService: ValidateService,
  ) {
  }

  @Post('addButtonType')
  @HttpCode(200)
  @ApiOperation({ description: '新增按钮类型' })
  @ApiHeader({
    name: 'token',
    description: '身份验证',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async addButtonType(@TokenId() user_id: number, @Body() buttonTypeDto: ButtonTypeDto): Promise<object> {
    this.validateService.isRequired(buttonTypeDto.type_name, { message: '按钮类型名称不能为空' });
    this.validateService.isString(buttonTypeDto.type_name, { message: '按钮类型名称类型有误' });
    this.validateService.isString(buttonTypeDto.remarks, { message: '备注类型输入有误' });
    return this.buttonService.addButtonType(user_id, buttonTypeDto);
  }

  @Post('addButton')
  @HttpCode(200)
  @ApiOperation({ description: '新增按钮' })
  @ApiHeader({
    name: 'token',
    description: '身份验证',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async addButton(@TokenId() user_id: number, @Body() buttonDto: ButtonDto): Promise<object> {
    this.validateService.isRequired(buttonDto.button_name, { message: '按钮名称不能为空' });
    this.validateService.isString(buttonDto.button_name, { message: '按钮名称类型有误' });
    this.validateService.isRequired(buttonDto.code, { message: '唯一标识code不能为空' });
    this.validateService.isString(buttonDto.code, { message: '唯一标识code类型有误' });
    this.validateService.isRequired(buttonDto.button_type_id, { message: '按钮类型不能为空' });
    this.validateService.isNumber(buttonDto.button_type_id, { message: '按钮类型id有误' });
    this.validateService.isString(buttonDto.remarks, { message: '备注类型有误' });
    return this.buttonService.addButton(user_id, buttonDto);
  }
}
