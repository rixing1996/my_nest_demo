import { ApiProperty } from '@nestjs/swagger';

export class ButtonTypeDto {
  @ApiProperty({
    required: false,
    description: '按钮类型id',
  })
  id: number;

  @ApiProperty({
    required: false,
    description: '按钮类型名称',
  })
  type_name: string;

  @ApiProperty({
    required: false,
    description: '备注',
  })
  remarks: string;
}
