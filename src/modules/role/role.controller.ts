import { Body, Controller, HttpCode, Post, Put, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TokenGuard } from '../../guard/token.guard';
import { RoleDto } from './dto/role.dto';
import { ValidateService } from '../../utils/validate.service';
import { TokenId } from '../../decorator/tokenId.decorator';

@Controller('api/role')
@ApiTags('角色部分')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly validateService: ValidateService,
  ) {
  }

  @Post('addRole')
  @HttpCode(200)
  @ApiOperation({ description: '新增角色' })
  @ApiHeader({
    name: 'token',
    required: true,
    description: '身份验证',
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async addRole(@Body() role: RoleDto, @TokenId() id: number): Promise<object> {
    this.validateService.isRequired(role.role_name, { message: '角色名称不能为空' });
    this.validateService.isString(role.role_name, { message: '角色名称类型有误' });
    this.validateService.isRequired(role.code, { message: 'code不能为空' });
    this.validateService.isNumber(role.code, { message: 'code类型有误' });
    this.validateService.isString(role.remarks, { message: '备注类型输入有误' });
    return this.roleService.addRole(id, role);
  }

  @Put('roleRelationsUsers')
  @ApiOperation({ description: '角色绑定用户账号' })
  @ApiHeader({
    name: 'token',
    required: true,
    description: '身份验证',
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async roleRelationsUsers(@TokenId() user_id: number, @Body() roleDto: RoleDto): Promise<object> {
    this.validateService.isRequired(roleDto.id, { message: '角色id不能为空' });
    this.validateService.isNumber(roleDto.id, { message: '角色id类型错误' });
    this.validateService.isRequired(roleDto.user_id_list, { message: 'user_id_list参数不能为空' });
    this.validateService.isNumberArray(roleDto.user_id_list, { message: 'user_id_list参数错误' });
    return this.roleService.roleRelationsUsers(user_id, roleDto);
  }
}
