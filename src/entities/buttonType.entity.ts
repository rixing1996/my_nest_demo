import { Column, Entity, OneToMany } from 'typeorm';
import { CommonBaseEntity } from './commonBase.entity';
import { ButtonEntity } from './button.entity';

@Entity('button_type')
export class ButtonTypeEntity extends CommonBaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '按钮类型名称',
    unique: true,
  })
  type_name: string;

  @OneToMany(type => ButtonEntity, buttonEntity => buttonEntity.button_type_id)
  buttonList: ButtonEntity[];
}
