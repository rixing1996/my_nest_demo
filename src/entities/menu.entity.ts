import { CommonBaseEntity } from './commonBase.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { RoleMenuEntity } from './roleMenu.entity';
import { ButtonEntity } from './button.entity';

@Entity('menu')
export class MenuEntity extends CommonBaseEntity {
  @Column({
    type: 'varchar',
    nullable: false,
    length: 50,
    comment: '菜单名称',
  })
  menu_name: string;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: '菜单对应的路由地址',
    unique: true,
  })
  url: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: '父级id',
  })
  parent_id: number;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: '菜单对应的图标地址',
  })
  icon_url: string;

  @OneToMany(type => RoleMenuEntity, roleMenuEntity => roleMenuEntity.menu)
  roleMenuList: RoleMenuEntity[];

  @ManyToMany(type => ButtonEntity, buttonEntity => buttonEntity.menuList)
  buttonList: ButtonEntity[];
}
