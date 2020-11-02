import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { CommonBaseEntity } from './commonBase.entity';
import { UserEntity } from './user.entity';
import { MenuEntity } from './menu.entity';
import { RoleMenuEntity } from './roleMenu.entity';

@Entity('role')
export class RoleEntity extends CommonBaseEntity {
  @Column({
    type: 'varchar',
    nullable: false,
    length: 50,
    comment: '角色名称',
    unique: true,
  })
  role_name: string;

  @Column({
    type: 'int',
    nullable: false,
    unique: true,
    comment: '角色唯一标识',
  })
  code: number;

  @OneToMany(type => UserEntity, userEntity => userEntity.role)
  userList: UserEntity[];

  @OneToMany(type => RoleMenuEntity, roleMenuEntity => roleMenuEntity.role)
  roleMenuList: RoleMenuEntity[];
}
