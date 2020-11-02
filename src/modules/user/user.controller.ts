import { Body, Controller, Delete, Get, HttpCode, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { ValidateService } from '../../utils/validate.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenGuard } from '../../guard/token.guard';
import { TokenId } from '../../decorator/tokenId.decorator';

@ApiTags('后台用户部分')
@Controller('api/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly validateService: ValidateService,
  ) {
  }

  @Post('addManageAccount')
  @HttpCode(200)
  @ApiOperation({ description: '添加管理员账号' })
  async addManageAccount(@Body() user: UserDto): Promise<object> {
    this.validateService.isRequired(user.user_name, { message: '用户名不能为空' });
    this.validateService.isString(user.user_name, { message: '用户名类型出错' });
    this.validateService.isRequired(user.phone, { message: '手机号不能为空' });
    this.validateService.isMobilePhone(user.phone, { message: '手机号输入有误' });
    this.validateService.isRequired(user.password, { message: '密码不能为空' });
    this.validateService.isString(user.password, { message: '密码类型出错' });
    return this.userService.addManageAccount(user);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ description: '用户登录' })
  async login(@Body() loginBody: LoginDto): Promise<object> {
    this.validateService.isRequired(loginBody.phone, { message: '手机号不能为空' });
    this.validateService.isMobilePhone(loginBody.phone, { message: '手机号输入有误' });
    this.validateService.isRequired(loginBody.password, { message: '密码不能为空' });
    this.validateService.isString(loginBody.password, { message: '密码输入有误' });
    return this.userService.login(loginBody);
  }

  @Get('getUserInfo')
  @ApiOperation({ description: '获取用户信息' })
  @ApiHeader({
    name: 'token',
    description: '身份验证token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async getUserInfo(@TokenId() id: number): Promise<object> {
    return this.userService.getUserInfo(id);
  }

  @Post('addUserAccount')
  @HttpCode(200)
  @ApiOperation({ description: '新增用户账号' })
  @ApiHeader({
    name: 'token',
    description: '身份验证token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async addUserAccount(@Body() user: UserDto, @TokenId() id: number): Promise<object> {
    this.validateService.isRequired(user.user_name, { message: '用户名不能为空' });
    this.validateService.isString(user.user_name, { message: '用户名输入有误' });
    this.validateService.isRequired(user.phone, { message: '手机号不能为空' });
    this.validateService.isMobilePhone(user.phone, { message: '手机号输入有误' });
    this.validateService.isRequired(user.password, { message: '密码不能为空' });
    this.validateService.isString(user.password, { message: '密码输入有误' });
    this.validateService.isEmail(user.email, { message: '邮箱输入有误' });
    this.validateService.isString(user.remarks, { message: '备注输入有误' });
    this.validateService.isString(user.head_pic, { message: '头像地址类型有误' });
    return this.userService.addUserAccount(id, user);
  }

  @Put('invalidUserAccount')
  @ApiOperation({ description: '账号作废' })
  @ApiHeader({
    name: 'token',
    description: '身份验证token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async invalidUserAccount(@TokenId() id: number, @Body() user: UserDto): Promise<object> {
    this.validateService.isRequired(user.id, { message: 'id不能为空' });
    this.validateService.isNumber(user.id, { message: 'id类型出错' });
    return this.userService.invalidUserAccount(id, user.id, true);
  }

  @Put('validUserAccount')
  @ApiOperation({ description: '账号重新使用' })
  @ApiHeader({
    name: 'token',
    description: '身份验证token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async validUserAccount(@TokenId() id: number, @Body() user: UserDto): Promise<object> {
    this.validateService.isRequired(user.id, { message: 'id不能为空' });
    this.validateService.isNumber(user.id, { message: 'id类型出错' });
    return this.userService.invalidUserAccount(id, user.id, false);
  }

  @Delete('deleteUserAccount')
  @ApiOperation({ description: '删除账号' })
  @ApiHeader({
    name: 'token',
    description: '身份验证token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async deleteUserAccount(@Body() user: UserDto): Promise<object> {
    this.validateService.isRequired(user.id, { message: 'id不能为空' });
    this.validateService.isNumber(user.id, { message: 'id类型出错' });
    return this.userService.deleteUserAccount(user.id);
  }

  @Put('updateUserAccount')
  @ApiOperation({ description: '编辑用户账号' })
  @ApiHeader({
    name: 'token',
    description: '身份验证token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async updateUserAccount(@TokenId() token_id: number, @Body() user: UserDto): Promise<object> {
    this.validateService.isRequired(user.id, { message: 'id不能为空' });
    this.validateService.isNumber(user.id, { message: 'id类型有误' });
    this.validateService.isRequired(user.user_name, { message: '用户名不能为空' });
    this.validateService.isString(user.user_name, { message: '用户名类型有误' });
    this.validateService.isRequired(user.phone, { message: '手机号不能为空' });
    this.validateService.isMobilePhone(user.phone, { message: '手机号输入有误' });
    this.validateService.isRequired(user.password, { message: '密码不能为空' });
    this.validateService.isString(user.password, { message: '密码类型有误' });
    this.validateService.isString(user.remarks, { message: '备注/描述输入有误' });
    this.validateService.isString(user.head_pic, { message: '头像地址输入有误' });
    this.validateService.isEmail(user.email, { message: '邮箱输入有误' });
    return this.userService.updateUserAccountInfo(token_id, user, false);
  }

  @Put('updateUserInfo')
  @ApiOperation({ description: '编辑账号个人信息' })
  @ApiHeader({
    name: 'token',
    description: '身份验证token',
    required: true,
  })
  @UseGuards(AuthGuard('jwt'), TokenGuard)
  async updateUserInfo(@TokenId() token_id: number, @Body() user: UserDto): Promise<object> {
    this.validateService.isRequired(user.user_name, { message: '用户名不能为空' });
    this.validateService.isString(user.user_name, { message: '用户名类型有误' });
    this.validateService.isString(user.remarks, { message: '备注/描述输入有误' });
    this.validateService.isString(user.head_pic, { message: '头像地址输入有误' });
    this.validateService.isEmail(user.email, { message: '邮箱输入有误' });
    return this.userService.updateUserAccountInfo(token_id, user, true);
  }
}
