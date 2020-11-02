import { Body, Controller, Get, HttpCode, Post, Put, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TokenGuard } from '../../guard/token.guard';
import { AuthorityService } from './authority.service';
import { ValidateService } from '../../utils/validate.service';
import { AuthorityDto } from './dto/authority.dto';
import { TokenId } from '../../decorator/tokenId.decorator';
import { RoleAuthorityDto } from './dto/roleAuthority.dto';

@Controller('api/authority')
@ApiTags('权限部分')
export class AuthorityController {
  constructor(
    private readonly authorityService: AuthorityService,
    private readonly validateService: ValidateService,
  ) {
  }

  @Get('getAuthorityList')
  @ApiOperation({ description: '查询权限列表' })
  @ApiHeader({
    name: 'token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async getAuthorityList(): Promise<object> {
    return this.authorityService.getAuthorityList();
  }

  @Post('addButtonRelationMenu')
  @HttpCode(200)
  @ApiOperation({ description: '关联按钮与菜单' })
  @ApiHeader({
    name: 'token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async addButtonRelationMenu(@Body() authorityDto: AuthorityDto): Promise<object> {
    this.validateService.isRequired(authorityDto.menu_id, { message: '菜单id不能为空' });
    this.validateService.isNumber(authorityDto.menu_id, { message: '菜单id类型有误' });
    this.validateService.isRequired(authorityDto.button_id, { message: '按钮id不能为空' });
    this.validateService.isNumber(authorityDto.button_id, { message: '按钮id类型有误' });
    return this.authorityService.addButtonRelationMenu(authorityDto);
  }

  @Put('setRoleAuthority')
  @ApiOperation({ description: '设置角色权限' })
  @ApiHeader({
    name: 'token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async setRoleAuthority(@TokenId() user_id: number, @Body() bodyDto: RoleAuthorityDto): Promise<object> {
    this.validateService.isRequired(bodyDto.role_id, { message: '角色id不能为空' });
    this.validateService.isNumber(bodyDto.role_id, { message: '角色id类型有误' });
    this.validateService.isRequired(bodyDto.menu_id_list, { message: 'menu_id_list不能为空' });
    this.validateService.isNumberArray(bodyDto.menu_id_list, { message: 'menu_id_list类型有误' });
    this.validateService.isRequired(bodyDto.button_list, { message: 'button_list不能为空' });
    return this.authorityService.setRoleAuthority(user_id, bodyDto);
  }

  @Get('getRoleRight')
  @ApiOperation({ description: '获取角色权限' })
  @ApiHeader({
    name: 'token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async getRoleRight(@TokenId() user_id: number): Promise<object> {
    return this.authorityService.getRoleRight(user_id);
  }
}
