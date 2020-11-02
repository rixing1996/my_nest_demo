import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    required: false,
    description: '编辑/删除/作废需要传的参数',
  })
  id: number;

  @ApiProperty({
    description: '用户名称，新增/编辑时必填',
    required: false,
  })
  user_name: string;

  @ApiProperty({
    description: '手机号，新增/编辑时必填',
    required: false,
  })
  phone: string;

  @ApiProperty({
    description: '密码，新增/编辑时必填',
    required: false,
  })
  password: string;

  @ApiProperty({
    required: false,
    description: '备注，描述',
  })
  remarks: string;

  @ApiProperty({
    required: false,
    description: '用户头像',
  })
  head_pic: string;

  @ApiProperty({
    required: false,
    description: '用户邮箱',
  })
  email: string;
}
