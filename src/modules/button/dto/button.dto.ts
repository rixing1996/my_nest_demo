import { ApiProperty } from '@nestjs/swagger';

export class ButtonDto {
  @ApiProperty({
    required: false,
    description: '备注',
  })
  remarks: string;

  @ApiProperty({
    required: false,
    description: '按钮名称',
  })
  button_name: string;

  @ApiProperty({
    required: false,
    description: '按钮唯一标识',
  })
  code: string;

  @ApiProperty({
    required: false,
    description: '按钮类型id',
  })
  button_type_id: number;
}
