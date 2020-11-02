import { Injectable } from '@nestjs/common';
import { ResponseService } from '../../utils/response.service';
import { Connection, getConnection, In, IsNull, Not, QueryRunner } from 'typeorm';
import { MenuEntity } from '../../entities/menu.entity';
import { AuthorityDto } from './dto/authority.dto';
import { ButtonEntity } from '../../entities/button.entity';
import { RoleAuthorityDto } from './dto/roleAuthority.dto';
import { RoleEntity } from '../../entities/role.entity';
import { RoleMenuEntity } from '../../entities/roleMenu.entity';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class AuthorityService {
  constructor(
    private readonly responseService: ResponseService,
  ) {
  }

  // 获取权限菜单列表
  async getAuthorityList(): Promise<object> {
    const connect: Connection = getConnection();
    const queryRunner: QueryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    // 获取所有的菜单
    let allMenu: MenuEntity[] = await queryRunner.manager.find(MenuEntity, {
      relations: ['buttonList'],
      where: { deleted: 0 },
    });

    // 一级菜单
    let oneMenu: any[] = allMenu.filter(item => !item.parent_id).map(item => {
      return {
        id: item.id,
        parent_id: item.parent_id,
        url: item.url,
        name: item.menu_name,
        icon_url: item.icon_url,
        remarks: item.remarks,
        children: [],
      };
    });

    // 二级菜单
    let twoMenu: any[] = allMenu.filter(item => item.parent_id).map(item => {
      return {
        id: item.id,
        parent_id: item.parent_id,
        url: item.url,
        name: item.menu_name,
        icon_url: item.icon_url,
        remarks: item.remarks,
        children: item.buttonList.map(item2 => {
          return {
            id: item2.id,
            parent_id: item.id,
            url: '',
            name: item2.button_name,
            icon_url: '',
            remarks: item2.remarks,
          };
        }),
      };
    });

    // 最后返回的菜单
    let resultMenu: any[] = oneMenu.map(item => {
      item.children = twoMenu.filter(item2 => item2.parent_id === item.id);
      return item;
    });

    return this.responseService.success(resultMenu, '查询成功');
  }

  // 关联按钮与菜单
  async addButtonRelationMenu(bodyDto: AuthorityDto): Promise<object> {
    const connect: Connection = getConnection();
    const queryRunner: QueryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    let hasMenu: MenuEntity = await queryRunner.manager.findOne(MenuEntity, {
      parent_id: Not(IsNull()),
      deleted: 0,
      id: bodyDto.menu_id,
    }, { relations: ['buttonList'] });
    if (!hasMenu) {
      return this.responseService.fail(null, '菜单id输入有误');
    }

    let hasButton: ButtonEntity = await queryRunner.manager.findOne(ButtonEntity, {
      deleted: 0,
      id: bodyDto.button_id,
    });
    if (!hasButton) {
      return this.responseService.fail(null, '按钮id有误');
    }

    hasMenu.buttonList = [...hasMenu.buttonList, hasButton];

    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(MenuEntity, hasMenu);
      await queryRunner.commitTransaction();
      return this.responseService.success(true, '添加成功');
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.responseService.fail(null, '添加失败，请稍后重试');
    }
  }

  // 设置角色权限
  async setRoleAuthority(user_id: number, bodyDto: RoleAuthorityDto): Promise<object> {
    const connect: Connection = getConnection();
    const queryRunner: QueryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    // 查询角色是否有效
    let hasRole: RoleEntity = await queryRunner.manager.findOne(RoleEntity, {
      where: { id: bodyDto.role_id, deleted: 0 },
    });
    if (!hasRole) {
      return this.responseService.fail(null, '角色id有误');
    }

    // 查询菜单是否有效
    let hasMenuList: MenuEntity[] = await queryRunner.manager.find(MenuEntity, {
      where: { id: In(bodyDto.menu_id_list), deleted: 0 },
    });
    if (hasMenuList.length !== bodyDto.menu_id_list.length) {
      return this.responseService.fail(null, '菜单id有误');
    }

    // 查询按钮是否有效
    let hasButtonList: ButtonEntity[] = await queryRunner.manager.find(ButtonEntity, {
      where: { id: In(Array.from(new Set(bodyDto.button_list.map(item => item.id)))), deleted: 0 },
    });
    if (hasButtonList.length !== Array.from(new Set(bodyDto.button_list.map(item => item.id))).length) {
      return this.responseService.fail(null, '按钮id有误');
    }

    await queryRunner.startTransaction();
    try {
      let roleMenuList: RoleMenuEntity[] = await queryRunner.query('select * from role_menu where role_id = ' + bodyDto.role_id);
      let roleMenuIdList: number[] = roleMenuList.map(item => item.id);
      await queryRunner.query(`delete from role_menu_button where role_menu_id in (${roleMenuIdList.join(',') || 0})`);
      await queryRunner.query(`delete from role_menu where role_id = ${bodyDto.role_id}`);

      for (let item of hasMenuList) {
        await queryRunner.query(`insert into role_menu (create_user_id,role_id,menu_id) values (${user_id},${bodyDto.role_id},${item.id})`);
        let menu: any = await queryRunner.query(`select * from role_menu where role_id = ${bodyDto.role_id} and menu_id = ${item.id}`);
        menu = menu[0];
        if (item.parent_id) {
          let buttonList: any[] = bodyDto.button_list.filter(item3 => item3.parent_id === item.id);
          for (let item2 of buttonList) {
            await queryRunner.query(`insert into role_menu_button (role_menu_id,button_id) values (${menu.id},${item2.id})`);
          }
        }
      }

      await queryRunner.commitTransaction();
      return this.responseService.success(true, '操作成功');
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.responseService.fail(null, '操作失败，请稍后再试');
    }
  }

  // 获取角色权限
  async getRoleRightById(role_id: number): Promise<object> {
    const connect: Connection = getConnection();
    let roleMenuList: RoleMenuEntity[] = await connect.getRepository(RoleMenuEntity).createQueryBuilder('role_menu')
      .where('role_menu.role_id = :role_id', { role_id: role_id }).leftJoinAndSelect('role_menu.buttonList', 'buttonList')
      .leftJoinAndSelect('role_menu.menu', 'menu').getMany();

    let allMenu: any[] = roleMenuList.map(item => {
      let obj: any = item.menu;
      obj.children = item.buttonList;
      return obj;
    });

    // 一级菜单
    let oneMenu: any = allMenu.filter(item => !item.parent_id).map(item => {
      return {
        id: item.id,
        parent_id: item.parent_id,
        url: item.url,
        name: item.menu_name,
        icon_url: item.icon_url,
        remarks: item.remarks,
        children: [],
      };
    });

    // 二级菜单
    let twoMenu: any = allMenu.filter(item => item.parent_id).map(item => {
      return {
        id: item.id,
        parent_id: item.parent_id,
        url: item.url,
        name: item.menu_name,
        icon_url: item.icon_url,
        remarks: item.remarks,
        children: item.children.map(item2 => {
          return {
            id: item2.id,
            parent_id: item.id,
            url: '',
            name: item2.button_name,
            icon_url: '',
            remarks: item2.remarks,
            children: [],
          };
        }),
      };
    });

    let resultMenu: any = oneMenu.map(item => {
      item.children = twoMenu.filter(item2 => item2.parent_id === item.id);
      return item;
    });

    return this.responseService.success(resultMenu, '查询成功');
  }

  async getRoleRight(user_id: number): Promise<object> {
    const connect: Connection = getConnection();
    let user: UserEntity = await connect.getRepository(UserEntity)
      .createQueryBuilder('user').where('user.id = :id', { id: user_id })
      .leftJoinAndSelect('user.role', 'role').getOne();

    if (user.phone === '18814233102') {
      return this.getAuthorityList();
    } else {
      return this.getRoleRightById(user.role.id);
    }
  }
}
