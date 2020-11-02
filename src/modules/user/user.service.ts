import { Injectable } from '@nestjs/common';
import { ResponseService } from '../../utils/response.service';
import { UserDto } from './dto/user.dto';
import { Connection, getConnection, QueryRunner } from 'typeorm';
import { UserEntity } from '../../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtMyService } from '../../jwt/jwt.myService';
import { CryptoService } from '../../utils/crypto.service';

@Injectable()
export class UserService {
  constructor(
    private readonly responseService: ResponseService,
    private readonly jwtMyService: JwtMyService,
    private readonly cryptoService: CryptoService,
  ) {
  }

  private loginArr: Array<any> = [];

  // 新增管理员账号
  async addManageAccount(user: UserDto): Promise<object> {
    if (user.phone === '18814233102' && user.password === '00cbc1c9899b725481fe7188f0f36826') {
      const connect = getConnection();
      const queryRunner = connect.createQueryRunner();
      queryRunner.connect();
      queryRunner.startTransaction();

      let hasOne: UserEntity = await queryRunner.manager.findOne(UserEntity, { phone: '18814233102' });
      if (hasOne) {
        return this.responseService.fail(null, '账号已存在');
      }

      let userEntity = new UserEntity();
      userEntity.user_name = user.user_name;
      userEntity.phone = user.phone;
      userEntity.password = user.password;

      try {
        await queryRunner.manager.save(UserEntity, userEntity);
        await queryRunner.commitTransaction();
        return this.responseService.success(userEntity.id, '添加成功');
      } catch (e) {
        await queryRunner.rollbackTransaction();
        return this.responseService.fail(null, '添加失败');
      }

    } else {
      return this.responseService.fail(null, '权限不足');
    }
  }

  // 将用户登录信息保存到loginArr中
  private pushToLogin(user: any): void {
    let currentIndex: number = -1;
    this.loginArr.forEach((item, index) => {
      if (item.id === user.id) {
        currentIndex = index;
      }
    });
    if (currentIndex === -1) {
      this.loginArr.push(user);
    } else {
      this.loginArr.splice(currentIndex, 1);
      this.loginArr.push(user);
    }
  }

  // 判断登录是否在其他地方登录
  isLoginInOther(tokenObject: any): boolean {
    if (this.loginArr.length === 0 || !this.loginArr.some(item => item.id === tokenObject.id)) {
      return false;
    } else {
      return this.loginArr.some(item => item.id === tokenObject.id && item.login_time > tokenObject.login_time);
    }
  }

  // 用户登录
  async login(loginBody: LoginDto): Promise<object> {
    let connect: Connection = getConnection();
    let user: UserEntity = await connect.manager.findOne(UserEntity, { phone: loginBody.phone });
    if (!user) {
      return this.responseService.fail(null, '当前用户不存在');
    } else {
      if (user.deleted === 1) {
        return this.responseService.fail(null, '当前账号已作废，请联系管理员');
      }
      if (user.password !== this.cryptoService.md5(loginBody.password)) {
        return this.responseService.fail(null, '密码错误');
      } else {
        let tokenObject: object = {
          id: user.id,
          login_time: Date.now(),
        };
        this.pushToLogin(tokenObject);
        return this.responseService.success(this.jwtMyService.createToken(tokenObject), '登录成功');
      }
    }
  }

  // 获取用户信息
  async getUserInfo(id: number): Promise<object> {
    const connect: Connection = getConnection();
    let user: any = await connect.getRepository(UserEntity).createQueryBuilder('user')
      .where('user.id = :id', { id }).leftJoinAndSelect('user.role', 'role').getOne();
    user = {
      user_name: user.user_name,
      phone: user.phone,
      head_pic: user.head_pic,
      email: user.email,
      remarks: user.remarks,
      role_id: user.role ? user.role.id : null,
      role_name: user.role ? user.role.role_name : null,
    };

    return this.responseService.success(user, '获取用户信息成功');
  }

  // 新增用户账号
  async addUserAccount(id: number, userBody: UserDto): Promise<object> {
    const connect: Connection = getConnection();
    const queryRunner: QueryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    let hasUser: UserEntity = await queryRunner.manager.findOne(UserEntity, { phone: userBody.phone });
    if (hasUser) {
      return this.responseService.fail(null, '手机号已存在');
    }

    let user: UserEntity = new UserEntity();
    user.create_user_id = id;
    user.user_name = userBody.user_name;
    user.phone = userBody.phone;
    user.password = this.cryptoService.md5Decrypt(userBody.password);
    userBody.remarks && (user.remarks = userBody.remarks);
    userBody.head_pic && (user.head_pic = userBody.head_pic);
    userBody.email && (user.email = userBody.email);

    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(UserEntity, user);
      await queryRunner.commitTransaction();
      return this.responseService.success(user.id, '添加成功');
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.responseService.fail(null, '添加失败');
    }
  }

  // 账号作废/启用
  async invalidUserAccount(token_id: number, id: number, deleted: boolean): Promise<object> {
    const connect: Connection = getConnection();
    const queryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    let user: UserEntity = await queryRunner.manager.findOne(UserEntity, id);
    if (!user) {
      return this.responseService.fail(null, '当前用户不存在');
    }

    user.update_user_id = token_id;
    user.deleted = deleted ? 1 : 0;

    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(UserEntity, user);
      await queryRunner.commitTransaction();
      this.loginArr.forEach(item => {
        if (item.id === user.id) {
          item.login_time = Date.now();
        }
      });
      return this.responseService.success(user.id, '操作成功');
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.responseService.fail(null, '作废失败，请重新操作');
    }
  }

  // 删除账号
  async deleteUserAccount(id: number): Promise<object> {
    const connect: Connection = getConnection();
    const queryRunner: QueryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    let user: UserEntity = await queryRunner.manager.findOne(UserEntity, id);
    if (!user) {
      return this.responseService.fail(null, '当前账号不存在');
    }

    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.remove(UserEntity, user);
      await queryRunner.commitTransaction();
      this.loginArr.forEach(item => {
        if (item.id === user.id) {
          item.login_time = Date.now();
        }
      });
      return this.responseService.success(id, '删除成功');
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.responseService.fail(null, '删除失败，请稍后再试');
    }
  }

  // 编辑账号信息
  async updateUserAccountInfo(token_id: number, userBody: UserDto, info: boolean): Promise<object> {
    const connect: Connection = getConnection();
    const queryRunner: QueryRunner = connect.createQueryRunner();
    await queryRunner.connect();

    let user: UserEntity = await queryRunner.manager.findOne(UserEntity, info ? token_id : userBody.id);
    let tokenUser: UserEntity = await queryRunner.manager.findOne(UserEntity, token_id);
    if (!user) {
      return this.responseService.fail(null, '当前用户不存在');
    } else {
      if (user.deleted === 1 && tokenUser.phone !== '18814233102') {
        return this.responseService.fail(null, '当前用户没有权限操作');
      }
    }

    user.update_user_id = token_id;
    user.user_name = userBody.user_name;
    !info && (user.phone = userBody.phone);
    !info && (user.password = this.cryptoService.md5Decrypt(userBody.password));
    userBody.remarks && (user.remarks = userBody.remarks);
    userBody.head_pic && (user.head_pic = userBody.head_pic);
    userBody.email && (user.email = userBody.email);

    await queryRunner.startTransaction();
    try {
      await queryRunner.manager.save(UserEntity, user);
      await queryRunner.commitTransaction();
      this.loginArr.forEach(item => {
        if (item.id === user.id) {
          item.login_time = Date.now();
        }
      });
      return this.responseService.success(user.id, '修改成功');
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return this.responseService.fail(null, '修改失败，请稍后重试');
    }
  }
}
