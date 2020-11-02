import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { CommonBaseEntity } from './commonBase.entity';
import { RoleEntity } from './role.entity';
import { MenuEntity } from './menu.entity';
import { ButtonEntity } from './button.entity';

@Entity('role_menu')
export class RoleMenuEntity extends CommonBaseEntity {
  @ManyToOne(type => RoleEntity, roleEntity => roleEntity.roleMenuList)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;

  @ManyToOne(type => MenuEntity, menuEntity => menuEntity.roleMenuList)
  @JoinColumn({ name: 'menu_id' })
  menu: MenuEntity;

  @ManyToMany(type => ButtonEntity, buttonEntity => buttonEntity.roleMenuList)
  @JoinTable({
    name: 'role_menu_button',
    joinColumn: {
      name: 'role_menu_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'button_id',
      referencedColumnName: 'id',
    },
  })
  buttonList: ButtonEntity[];
}
