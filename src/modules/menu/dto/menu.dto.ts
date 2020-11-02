import { ApiProperty } from '@nestjs/swagger';

export class MenuDto {
  @ApiProperty({
    required: false,
    description: '菜单id',
  })
  id: number;

  @ApiProperty({
    required: false,
    description: '备注',
  })
  remarks: string;

  @ApiProperty({
    required: false,
    description: '菜单名称',
  })
  menu_name: string;

  @ApiProperty({
    required: false,
    description: '路由地址',
  })
  url: string;

  @ApiProperty({
    required: false,
    description: '父级id',
  })
  parent_id: number;

  @ApiProperty({
    required: false,
    description: '菜单图标路径',
  })
  icon_url: string;
}
