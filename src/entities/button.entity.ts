import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { CommonBaseEntity } from './commonBase.entity';
import { type } from 'os';
import { ButtonTypeEntity } from './buttonType.entity';
import { MenuEntity } from './menu.entity';
import { RoleMenuEntity } from './roleMenu.entity';

@Entity('button')
export class ButtonEntity extends CommonBaseEntity {
  @Column({
    type: 'varchar',
    nullable: false,
    length: 50,
    comment: '按钮名称',
  })
  button_name: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
    comment: '按钮唯一标识',
  })
  code: string;

  @Column({
    type: 'int',
    nullable: false,
    comment: '按钮类型id',
  })
  @ManyToOne(type => ButtonTypeEntity, buttonTypeEntity => buttonTypeEntity.buttonList)
  @JoinColumn({ name: 'button_type_id', referencedColumnName: 'id' })
  button_type_id: number;

  @ManyToMany(type => MenuEntity, menuEntity => menuEntity.buttonList)
  @JoinTable({
    name: 'button_menu',
    joinColumn: {
      name: 'button_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'menu_id',
      referencedColumnName: 'id',
    },
  })
  menuList: MenuEntity[];

  @ManyToMany(type => RoleMenuEntity, roleMenuEntity => roleMenuEntity.buttonList)
  roleMenuList: RoleMenuEntity[];
}
