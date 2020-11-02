import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    required: true,
    description: '登陆手机号',
  })
  phone: string;

  @ApiProperty({
    required: true,
    description: '登陆密码',
  })
  password: string;
}
