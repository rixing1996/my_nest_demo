import { ApiProperty } from '@nestjs/swagger';

export class RoleAuthorityDto {
  @ApiProperty({
    required: false,
    description: '角色id',
  })
  role_id: number;

  @ApiProperty({
    required: false,
    description: '菜单id列表',
  })
  menu_id_list: number[];

  @ApiProperty({
    required: false,
    description: '按钮id列表',
  })
  button_list: any[];
}
