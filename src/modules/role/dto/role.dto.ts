import { ApiProperty } from '@nestjs/swagger';

export class RoleDto {
  @ApiProperty({
    required: false,
    description: '用户id，编辑必填',
  })
  id: number;

  @ApiProperty({
    required: false,
    description: '备注',
  })
  remarks: string;

  @ApiProperty({
    required: false,
    description: '角色名称',
  })
  role_name: string;

  @ApiProperty({
    required: false,
    description: '角色唯一标识',
  })
  code: number;

  @ApiProperty({
    required: false,
    description: '绑定的用户账号id列表',
  })
  user_id_list: number[];
}
