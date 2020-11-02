import { Injectable } from '@nestjs/common';
import { ResponseService } from '../../utils/response.service';
import { ButtonTypeDto } from './dto/buttonType.dto';
import { Connection, getConnection, QueryRunner } from 'typeorm';
import { ButtonTypeEntity } from '../../entities/buttonType.entity';
import { ButtonDto } from './dto/button.dto';
import { ButtonEntity } from '../../entities/button.entity';

@Injectable()
export class ButtonService {
  constructor(
    private readonly responseService: ResponseService,
  ) {
  }

  async addButtonType(user_id: number, buttonTypeDto: ButtonTypeDto): Promise<object> {
    const connect: Connection = getConnection();
    const queryRunner: QueryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    let hasButtonType: ButtonTypeEntity = await queryRunner.manager.findOne(ButtonTypeEntity, { type_name: buttonTypeDto.type_name });
    if (hasButtonType) {
      return this.responseService.fail(null, '按钮类型名称已存在');
    }

    let buttonType: ButtonTypeEntity = new ButtonTypeEntity();
    buttonType.type_name = buttonTypeDto.type_name;
    buttonTypeDto.remarks && (buttonType.remarks = buttonTypeDto.remarks);

    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(ButtonTypeEntity, buttonType);
      await queryRunner.commitTransaction();
      return this.responseService.success(buttonType.id, '添加成功');
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.responseService.fail(null, '添加失败，请稍后再试');
    }
  }

  async addButton(user_id: number, buttonDto: ButtonDto): Promise<object> {
    const connect: Connection = getConnection();
    const queryRunner: QueryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    // 判断按钮类型是否存在
    let hasButtonType: ButtonTypeEntity = await queryRunner.manager.findOne(ButtonTypeEntity, {
      id: buttonDto.button_type_id,
      deleted: 0,
    });
    if (!hasButtonType) {
      return this.responseService.fail(null, '按钮类型有误');
    }

    // 判断唯一标识是否存在
    let hasButtonCode: ButtonEntity = await queryRunner.manager.findOne(ButtonEntity, {
      code: buttonDto.code,
    });
    if (hasButtonCode) {
      return this.responseService.fail(null, '唯一标识code已存在');
    }

    let button: ButtonEntity = new ButtonEntity();
    button.button_name = buttonDto.button_name;
    button.code = buttonDto.code;
    button.button_type_id = buttonDto.button_type_id;
    button.create_user_id = user_id;
    buttonDto.remarks && (button.remarks = buttonDto.remarks);

    button.button_type_id = buttonDto.button_type_id;

    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(ButtonEntity, button);
      await queryRunner.commitTransaction();
      return this.responseService.success(button.id, '添加成功');
    } catch (e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
      return this.responseService.fail(null, '添加失败，请稍后重试');
    }
  }
}
