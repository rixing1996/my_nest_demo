import { Injectable } from '@nestjs/common';
import { ResponseService } from '../../utils/response.service';
import { RoleDto } from './dto/role.dto';
import { Connection, getConnection, QueryRunner } from 'typeorm';
import { RoleEntity } from '../../entities/role.entity';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class RoleService {
  constructor(
    private readonly responseService: ResponseService,
  ) {
  }

  // 新增角色
  async addRole(user_id: number, roleDto: RoleDto): Promise<object> {
    const connect: Connection = getConnection();
    const queryRunner: QueryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    let hasRole: RoleEntity = await queryRunner.manager.findOne(RoleEntity, {
      where: [{ role_name: roleDto.role_name }, { code: roleDto.code }],
    });

    if (hasRole) {
      return this.responseService.fail(null, hasRole.role_name === roleDto.role_name ? '角色名称已存在' : 'code已存在');
    }

    let role: RoleEntity = new RoleEntity();
    role.role_name = roleDto.role_name;
    role.code = roleDto.code;
    role.remarks = roleDto.remarks;
    role.create_user_id = user_id;

    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(RoleEntity, role);
      await queryRunner.commitTransaction();
      return this.responseService.success(role.id, '新增成功');
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.responseService.fail(null, '新增失败');
    }
  }

  // 角色绑定用户
  async roleRelationsUsers(user_id: number, roleDto: RoleDto): Promise<object> {
    if (roleDto.user_id_list.length === 0) {
      return this.responseService.fail(null, '用户id不能为空');
    }

    const connect: Connection = getConnection();
    const queryRunner: QueryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    let findRole: RoleEntity = await queryRunner.manager.findOne(RoleEntity, { id: roleDto.id, deleted: 0 });
    if (!findRole) {
      return this.responseService.fail(null, '角色id无效');
    }

    await queryRunner.startTransaction();
    try {
      findRole.userList = [];
      for (const item of roleDto.user_id_list) {
        let user: UserEntity = await queryRunner.manager.findOne(UserEntity, { id: item, deleted: 0 });
        if (!user) {
          throw new Error();
        }
        user.update_user_id = user_id;
        findRole.userList.push(user);
        await queryRunner.manager.save(UserEntity, user);
      }
      await queryRunner.manager.save(RoleEntity, findRole);
      await queryRunner.commitTransaction();
      return this.responseService.success(true, '操作成功');
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.responseService.fail(null, '操作失败，请稍后再试');
    }
  }
}
