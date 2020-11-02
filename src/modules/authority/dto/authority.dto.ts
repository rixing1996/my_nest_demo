import { ApiProperty } from '@nestjs/swagger';

export class AuthorityDto {
  @ApiProperty({
    required: false,
    description: '按钮id',
  })
  button_id: number;

  @ApiProperty({
    required: false,
    description: '菜单id',
  })
  menu_id: number;
}
