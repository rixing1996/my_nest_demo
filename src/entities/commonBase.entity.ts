import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export class CommonBaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int',
    comment: '主键id',
  })
  id: number;

  @Column({
    type: 'tinyint',
    nullable: false,
    default: () => 0,
    comment: '是否删除，0为正常，1为删除，假删除字段',
  })
  deleted: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: '备注',
  })
  remarks: string;

  @Column({
    type: 'bigint',
    nullable: true,
    comment: '创建人的id',
  })
  create_user_id: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    comment: '创建时间',
  })
  create_time: Date;

  @Column({
    type: 'bigint',
    nullable: true,
    comment: '修改人id',
  })
  update_user_id: number;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: false,
    comment: '修改时间',
  })
  update_time: Date;
}
