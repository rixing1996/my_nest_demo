import { CommonBaseEntity } from './commonBase.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity('user')
export class UserEntity extends CommonBaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '用户名称',
  })
  user_name: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false,
    unique: true,
    comment: '手机号',
  })
  phone: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    comment: '密码',
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: '用户头像',
  })
  head_pic: string;

  @Column({
    type: 'varchar',
    nullable: true,
    comment: '邮箱',
  })
  email: string;

  @ManyToOne(type => RoleEntity, roleEntity => roleEntity.userList)
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;
}
