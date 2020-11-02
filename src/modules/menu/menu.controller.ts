import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TokenGuard } from '../../guard/token.guard';
import { MenuService } from './menu.service';
import { ValidateService } from '../../utils/validate.service';
import { TokenId } from '../../decorator/tokenId.decorator';
import { MenuDto } from './dto/menu.dto';

@Controller('api/menu')
@ApiTags('菜单部分')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly validateService: ValidateService,
  ) {
  }

  @Post('addMenu')
  @ApiOperation({ description: '新增菜单' })
  @HttpCode(200)
  @ApiHeader({
    name: 'token',
    description: '身份验证token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async addMenu(@TokenId() user_id: number, @Body() menuDto: MenuDto): Promise<object> {
    this.validateService.isRequired(menuDto.menu_name, { message: '菜单名称不能为空' });
    this.validateService.isString(menuDto.menu_name, { message: '菜单名称类型有误' });
    if (menuDto.url || menuDto.parent_id) {
      this.validateService.isRequired(menuDto.parent_id, { message: '菜单父级id不能为空' });
      this.validateService.isRequired(menuDto.url, { message: '路由地址不能为空' });
    }
    this.validateService.isNumber(menuDto.parent_id, { message: '菜单父级id类型有误' });
    this.validateService.isRouteUrl(menuDto.url, { message: '路由地址有误' });
    this.validateService.isString(menuDto.remarks, { message: '备注类型有误' });
    this.validateService.isString(menuDto.icon_url, { message: '图标类型有误' });
    return this.menuService.addMenu(user_id, menuDto);
  }
}
