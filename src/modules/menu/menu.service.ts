import { Injectable } from '@nestjs/common';
import { ResponseService } from '../../utils/response.service';
import { MenuDto } from './dto/menu.dto';
import { Connection, getConnection, QueryRunner } from 'typeorm';
import { MenuEntity } from '../../entities/menu.entity';

@Injectable()
export class MenuService {
  constructor(
    private readonly responseService: ResponseService,
  ) {
  }

  // 新增菜单
  async addMenu(user_id: number, menuDto: MenuDto): Promise<object> {
    const connect: Connection = getConnection();
    const queryRunner: QueryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    if (menuDto.parent_id || menuDto.url) {
      let oldMenu: MenuEntity = await queryRunner.manager.findOne(MenuEntity, { url: menuDto.url, deleted: 0 });
      let parentMenu: MenuEntity = await queryRunner.manager.findOne(MenuEntity, {
        id: menuDto.parent_id,
        deleted: 0,
      });
      if (!parentMenu) {
        return this.responseService.fail(null, '父级id有误');
      }
      if (oldMenu) {
        return this.responseService.fail(null, '路由路径已存在');
      }
    }

    let menu: MenuEntity = new MenuEntity();
    menu.menu_name = menuDto.menu_name;
    menu.create_user_id = user_id;
    menuDto.url && (menu.url = menuDto.url);
    menuDto.parent_id && (menu.parent_id = menuDto.parent_id);
    menuDto.icon_url && (menu.icon_url = menuDto.icon_url);
    menuDto.remarks && (menu.remarks = menuDto.remarks);

    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(MenuEntity, menu);
      await queryRunner.commitTransaction();
      return this.responseService.success(menu.id, '添加成功');
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.responseService.fail(null, '添加失败，请稍后再试');
    }
  }
}
